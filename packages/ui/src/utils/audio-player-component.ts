import { State, MixedInCtor } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { AudioPlayerFacade, AudioPlayerUpdate } from '../contracts';

/**
 * The page whose player the app's single audio player currently plays.
 *
 * Every audio page drives the same player and the same update listener. With
 * ion-router-outlet the next page is created, and starts the player, before
 * the page it replaces is removed, so the removed page must not stop the
 * player or unregister the listener any more: they are the new page's. The
 * same goes for a page left while still starting, once another has started.
 */
let owner: symbol | null = null;

/**
 * Read earpiece state from storage or default to false
 */
export function readEarpiece(): boolean {
  return globalThis.localStorage.getItem('audio-earpiece') == 'yes' ? true : false;
}

/**
 * Mixin for the pages that play audio: `class PageStation extends Mixin(audioPlayerComponent)`.
 *
 * The page declares `@Prop() facade` itself, with its own facade type. It
 * calls initAudioPlayer() in componentDidLoad() and destroyAudioPlayer() in
 * disconnectedCallback(), and reacts to the player by overriding the on*()
 * methods.
 *
 * Pages import it from this file, not from the utils barrel: a Stencil app
 * compiling this library from node_modules resolves a mixin only through the
 * module that defines it. Every member is public, since the type of an
 * exported class expression cannot have private or protected members, and so
 * are the page's overrides, against stencil/own-methods-must-be-private.
 */
export const audioPlayerComponent = <B extends MixedInCtor>(Base: B) => {
  class AudioPlayerComponent extends Base {
    @State() playing: boolean = false;
    @State() position = 0;
    @State() duration = 0;
    /** Index of the active item as the page counts it, see onAudioIndexChange() */
    @State() activeIndex = 0;
    @State() earpiece = readEarpiece();

    /**
     * Index of the active audio in the player, -1 for none. A page counting
     * something else than audios maps it to its activeIndex in onAudioIndexChange().
     */
    audioIndex = 0;

    /**
     * Set by destroyAudioPlayer(), which can run while initAudioPlayer() still
     * awaits the player: a page left right after opening it.
     */
    destroyed = false;

    /**
     * The page's @Prop() facade. The page declares it with its own facade
     * type, which a field declared here would overwrite.
     */
    get audioPlayerFacade(): AudioPlayerFacade {
      return (this as unknown as { facade: AudioPlayerFacade }).facade;
    }

    /** Identifies this page's player as the `owner` */
    readonly ownerToken = Symbol('audioPlayerComponent');

    /** Whether this page's player is the one the app's single player now plays */
    get isOwner() {
      return owner === this.ownerToken;
    }

    /**
     * Initialize audio player with given stations
     * Should be called in componentDidLoad() lifecycle method.
     * Without any audio there is nothing to play, and the player is not started.
     * An audioIndex of -1 starts the player without selecting an item.
     */
    async initAudioPlayer(stations: Array<Station>) {
      if (!stations.some(station => station.audios?.length > 0)) {
        return;
      }

      owner = this.ownerToken;
      await this.audioPlayerFacade.getAudioPlayerService().start(stations);

      if (this.destroyed || !this.isOwner) {
        // Left while the player started. Selecting now would ask for an item a
        // stopped player no longer has, and a listener registered now would
        // outlive the page. The page's own stop() may have come before start()
        // finished, so stop again -- unless another page has started since.
        if (owner === null) {
          await this.stopLeftoverPlayer();
        }
        return;
      }

      if (this.earpiece) {
        await this.audioPlayerFacade.getAudioPlayerService().setEarpiece();
      } else {
        await this.audioPlayerFacade.getAudioPlayerService().setSpeaker();
      }

      if (this.destroyed || !this.isOwner) {
        return;
      }

      this.audioPlayerFacade.getAudioPlayerService().registerUpdateListener(async (update: AudioPlayerUpdate) => {
        if (this.destroyed) {
          return;
        }
        if (update.state == 'playing') {
          this.playing = true;
          this.triggerPositionUpdate();
        } else if (update.state == 'paused') {
          this.playing = false;
        } else if (update.state == 'skip') {
          this.updateAudioIndex(update.index);
          await this.onSkip(update);
          await this.resetAudioPlayer();
        } else if (update.state == 'completed') {
          await this.onCompleted(update);
        } else if (update.state == 'collected') {
          try {
            const stationId = this.audioPlayerFacade.getAudioPlayerService().getStationId(update.index);
            const station = await this.audioPlayerFacade.getStationService().updateCollectedPercentage(stationId, update.id, update.percentage);
            await this.onCollected(update, station);
          } catch (e) {
            console.error('Error updating collected percentage for station', e);
          }
        }
      });

      if (this.audioIndex >= 0) {
        await this.audioPlayerFacade.getAudioPlayerService().select(this.audioIndex);
      }
      await this.resetAudioPlayer();
    }

    /**
     * Destroy audio player and unregister update listener
     * Should be called in disconnectedCallback() lifecycle method
     */
    async destroyAudioPlayer() {
      this.destroyed = true;
      this.playing = false;
      // The player and its listener belong to the next page once it started
      if (this.isOwner) {
        owner = null;
        await this.audioPlayerFacade.getAudioPlayerService().stop();
        this.audioPlayerFacade.getAudioPlayerService().unregisterUpdateListener();
      }
    }

    /**
     * Stops what a start() that finished after the page's own stop() left
     * behind. Nothing is playing at that point, so the cleanup is best effort
     * rather than a rejection nobody handles.
     */
    async stopLeftoverPlayer() {
      try {
        await this.audioPlayerFacade.getAudioPlayerService().stop();
      } catch (e) {
        console.warn('Could not stop the audio player of a page left while it started', e);
      }
    }

    async resetAudioPlayer() {
      this.playing = false;
      this.position = 0;
      this.duration = await this.audioPlayerFacade.getAudioPlayerService().getDuration();
    }

    /**
     * Sets the audio the player selects once it is initialized: the first one
     * of the given station, -1 if it has no audio. This works even if the
     * audio player is not yet initialized, and leaves activeIndex to the page.
     */
    setAudioIndexByStationId(id: string, stations: Array<Station>) {
      const items = this.audioPlayerFacade.getAudioPlayerService().getPlayerItems(stations);
      this.audioIndex = this.audioPlayerFacade.getAudioPlayerService().getIndexByStationId(id, items);
    }

    updateAudioIndex(audioIndex: number) {
      this.audioIndex = audioIndex;
      this.onAudioIndexChange(audioIndex);
    }

    async select(audioIndex: number) {
      await this.audioPlayerFacade.getAudioPlayerService().select(audioIndex);
    }

    async next() {
      await this.audioPlayerFacade.getAudioPlayerService().next();
    }

    async prev() {
      await this.audioPlayerFacade.getAudioPlayerService().prev();
    }

    async play() {
      await this.audioPlayerFacade.getAudioPlayerService().play();
    }

    async pause() {
      await this.audioPlayerFacade.getAudioPlayerService().pause();
    }

    async playPause() {
      if (this.playing) {
        await this.pause();
      } else {
        await this.play();
      }
    }

    async startPositionChange() {
      await this.audioPlayerFacade.getAudioPlayerService().pause();
    }

    async changePosition(position: number) {
      this.position = position;
      await this.audioPlayerFacade.getAudioPlayerService().seek(position);
      await this.audioPlayerFacade.getAudioPlayerService().play();
    }

    async toggleOutput() {
      if (this.earpiece) {
        await this.audioPlayerFacade.getAudioPlayerService().setSpeaker();
      } else {
        await this.audioPlayerFacade.getAudioPlayerService().setEarpiece();
      }
      this.earpiece = !this.earpiece;
      globalThis.localStorage.setItem('audio-earpiece', this.earpiece ? 'yes' : 'no');
    }

    /**
     * The player moved to another audio. By default the page counts audios,
     * so its activeIndex is the player's.
     */
    onAudioIndexChange(audioIndex: number) {
      this.activeIndex = audioIndex;
    }

    async onSkip(_update: AudioPlayerUpdate) {}

    /**
     * By default the player rewinds the audio it completed
     */
    async onCompleted(_update: AudioPlayerUpdate) {
      await this.audioPlayerFacade.getAudioPlayerService().pause();
      await this.audioPlayerFacade.getAudioPlayerService().seek(0);
      this.position = 0;
    }

    async onCollected(_update: AudioPlayerUpdate, _station: Station) {}

    async triggerPositionUpdate() {
      this.position = await this.audioPlayerFacade.getAudioPlayerService().getPosition();
      this.duration = await this.audioPlayerFacade.getAudioPlayerService().getDuration();

      if (this.duration > 0 && this.position < this.duration) {
        setTimeout(() => {
          if (this.playing) {
            this.triggerPositionUpdate();
          }
        }, 800);
      }
    }
  }
  return AudioPlayerComponent;
};

import { Station } from '@smartcompanion/data';
import { AudioPlayerFacade, AudioPlayerUpdate } from '../contracts';

interface AudioPlayerPage {
  facade: AudioPlayerFacade;
  earpiece: boolean;
  playing: boolean;
  position: number;
  duration: number;
  activeIndex: number;
}

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

export class ReactiveAudioPlayer {
  private facade: AudioPlayerFacade;
  private earpiece: boolean = false;
  private playing: boolean = false;
  private position: number = 0;
  private duration: number = 0;
  private activeIndex: number = 0;

  private earpieceListener: ((earpiece: boolean) => void) | null = null;
  private playingListener: ((playing: boolean) => void) | null = null;
  private positionListener: ((position: number) => void) | null = null;
  private durationListener: ((duration: number) => void) | null = null;
  private activeIndexListener: ((activeIndex: number) => void) | null = null;
  private completedListener: ((update: AudioPlayerUpdate) => Promise<void>) | null = async () => {
    await this.facade.getAudioPlayerService().pause();
    await this.facade.getAudioPlayerService().seek(0);
    this.updatePosition(0);
  };
  private collectedListener: ((update: AudioPlayerUpdate, station: Station) => Promise<void>) | null = null;
  private skipListener: ((update: AudioPlayerUpdate) => Promise<void>) | null = null;

  /**
   * Set by destroyAudioPlayer(), which can run while initAudioPlayer() still
   * awaits the player: a page left right after opening it.
   */
  private destroyed = false;

  /** Identifies this page's player as the `owner` */
  private readonly ownerToken = Symbol('ReactiveAudioPlayer');

  /** Whether this page's player is the one the app's single player now plays */
  private get isOwner() {
    return owner === this.ownerToken;
  }

  constructor(page: AudioPlayerPage) {
    this.facade = page.facade;
    this.earpiece = page.earpiece;
    this.playing = page.playing;
    this.position = page.position;
    this.duration = page.duration;
    this.activeIndex = page.activeIndex;
    this.setDefaultUpdateListeners(page);
    this.initEarpiece();
  }

  setDefaultUpdateListeners(page: { earpiece: boolean; playing: boolean; position: number; duration: number; activeIndex: number }) {
    this.setOnEarpieceUpdateListener((earpiece: boolean) => {
      page.earpiece = earpiece;
    });
    this.setOnPlayingUpdateListener((playing: boolean) => {
      page.playing = playing;
    });
    this.setOnPositionUpdateListener((position: number) => {
      page.position = position;
    });
    this.setOnDurationUpdateListener((duration: number) => {
      page.duration = duration;
    });
    this.setOnActiveIndexUpdateListener((activeIndex: number) => {
      page.activeIndex = activeIndex;
    });
  }

  setOnEarpieceUpdateListener(listener: (earpiece: boolean) => void) {
    this.earpieceListener = listener;
  }
  setOnPlayingUpdateListener(listener: (playing: boolean) => void) {
    this.playingListener = listener;
  }
  setOnPositionUpdateListener(listener: (position: number) => void) {
    this.positionListener = listener;
  }
  setOnDurationUpdateListener(listener: (duration: number) => void) {
    this.durationListener = listener;
  }
  setOnActiveIndexUpdateListener(listener: (activeIndex: number) => void) {
    this.activeIndexListener = listener;
  }
  setOnCompletedListener(listener: (update: AudioPlayerUpdate) => Promise<void>) {
    this.completedListener = listener;
  }
  setOnCollectedListener(listener: (update: AudioPlayerUpdate, station: Station) => Promise<void>) {
    this.collectedListener = listener;
  }
  setOnSkipListener(listener: (update: AudioPlayerUpdate) => Promise<void>) {
    this.skipListener = listener;
  }

  removeAllListeners() {
    this.earpieceListener = null;
    this.playingListener = null;
    this.positionListener = null;
    this.durationListener = null;
    this.activeIndexListener = null;
    this.completedListener = null;
    this.collectedListener = null;
    this.skipListener = null;
  }

  updateEarpiece(earpiece: boolean) {
    this.earpiece = earpiece;
    if (this.earpieceListener !== null) {
      this.earpieceListener(earpiece);
    }
  }

  updatePlaying(playing: boolean) {
    this.playing = playing;
    if (this.playingListener !== null) {
      this.playingListener(playing);
    }
  }

  updatePosition(position: number) {
    this.position = position;
    if (this.positionListener !== null) {
      this.positionListener(position);
    }
  }

  updateDuration(duration: number) {
    this.duration = duration;
    if (this.durationListener !== null) {
      this.durationListener(duration);
    }
  }

  updateActiveIndex(activeIndex: number) {
    this.activeIndex = activeIndex;
    if (this.activeIndexListener !== null) {
      this.activeIndexListener(activeIndex);
    }
  }

  /**
   * Read earpiece state from storage or default to false
   */
  readEarpiece(): boolean {
    return globalThis.localStorage.getItem('audio-earpiece') == 'yes' ? true : false;
  }

  /**
   * Initialize earpiece/speaker state from local storage
   * Should be called in componentWillLoad() lifecycle method
   */
  async initEarpiece() {
    this.updateEarpiece(this.readEarpiece());
  }

  /**
   * Initialize eaudio player with given stations
   * Should be called in componentDidLoad() lifecycle method.
   * Without any audio there is nothing to play, and the player is not started.
   * An activeIndex of -1 starts the player without selecting an item.
   */
  async initAudioPlayer(stations: Array<Station>) {
    if (!stations.some(station => station.audios?.length > 0)) {
      return;
    }

    owner = this.ownerToken;
    await this.facade.getAudioPlayerService().start(stations);

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
      await this.facade.getAudioPlayerService().setEarpiece();
    } else {
      await this.facade.getAudioPlayerService().setSpeaker();
    }

    if (this.destroyed || !this.isOwner) {
      return;
    }

    this.facade.getAudioPlayerService().registerUpdateListener(async (update: AudioPlayerUpdate) => {
      if (update.state == 'playing') {
        this.updatePlaying(true);
        this.triggerPositionUpdate();
      } else if (update.state == 'paused') {
        this.updatePlaying(false);
      } else if (update.state == 'skip') {
        this.updateActiveIndex(update.index);
        await this.onSkip(update);
        await this.resetAudioPlayer();
      } else if (update.state == 'completed') {
        await this.onCompleted(update);
      } else if (update.state == 'collected') {
        try {
          const stationId = this.facade.getAudioPlayerService().getStationId(update.index);
          const station = await this.facade.getStationService().updateCollectedPercentage(stationId, update.id, update.percentage);
          await this.onCollected(update, station);
        } catch (e) {
          console.error('Error updating collected percentage for station', e);
        }
      }
    });

    if (this.activeIndex >= 0) {
      await this.facade.getAudioPlayerService().select(this.activeIndex);
    }
    await this.resetAudioPlayer();
  }

  /**
   * Destroy audio player and unregister update listener
   * Should be called in disconnectedCallback() lifecycle method
   */
  async destroyAudioPlayer() {
    this.destroyed = true;
    this.updatePlaying(false);
    this.removeAllListeners();
    // The player and its listener belong to the next page once it started
    if (this.isOwner) {
      owner = null;
      await this.facade.getAudioPlayerService().stop();
      this.facade.getAudioPlayerService().unregisterUpdateListener();
    }
  }

  /**
   * Stops what a start() that finished after the page's own stop() left
   * behind. Nothing is playing at that point, so the cleanup is best effort
   * rather than a rejection nobody handles.
   */
  private async stopLeftoverPlayer() {
    try {
      await this.facade.getAudioPlayerService().stop();
    } catch (e) {
      console.warn('Could not stop the audio player of a page left while it started', e);
    }
  }

  async resetAudioPlayer() {
    this.updatePlaying(false);
    this.updatePosition(0);
    this.updateDuration(await this.facade.getAudioPlayerService().getDuration());
  }

  async select(audioIndex: number) {
    await this.facade.getAudioPlayerService().select(audioIndex);
  }

  async next() {
    await this.facade.getAudioPlayerService().next();
  }

  async prev() {
    await this.facade.getAudioPlayerService().prev();
  }

  async play() {
    await this.facade.getAudioPlayerService().play();
  }

  async pause() {
    await this.facade.getAudioPlayerService().pause();
  }

  async playPause() {
    if (this.playing) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async startPositionChange() {
    await this.facade.getAudioPlayerService().pause();
  }

  async changePosition(position: number) {
    this.updatePosition(position);
    await this.facade.getAudioPlayerService().seek(position);
    await this.facade.getAudioPlayerService().play();
  }

  /**
   * Update activeIndex to the first audio of the given station, -1 if it has no audio.
   * This works even if audioplayer is not yet initialized
   */
  updateActiveIndexByStationId(id: string, stations: Array<Station>) {
    const items = this.facade.getAudioPlayerService().getPlayerItems(stations);
    this.updateActiveIndex(this.facade.getAudioPlayerService().getIndexByStationId(id, items));
  }

  async toggleOutput() {
    if (this.earpiece) {
      await this.facade.getAudioPlayerService().setSpeaker();
    } else {
      await this.facade.getAudioPlayerService().setEarpiece();
    }
    this.updateEarpiece(!this.earpiece);
    globalThis.localStorage.setItem('audio-earpiece', this.earpiece ? 'yes' : 'no');
  }

  async onSkip(update: AudioPlayerUpdate) {
    if (this.skipListener !== null) {
      await this.skipListener(update);
    }
  }

  async onCompleted(update: AudioPlayerUpdate) {
    if (this.completedListener !== null) {
      await this.completedListener(update);
    }
  }

  async onCollected(update: AudioPlayerUpdate, station: Station) {
    if (this.collectedListener !== null) {
      await this.collectedListener(update, station);
    }
  }

  async triggerPositionUpdate() {
    this.updatePosition(await this.facade.getAudioPlayerService().getPosition());
    this.updateDuration(await this.facade.getAudioPlayerService().getDuration());

    if (this.duration > 0 && this.position < this.duration) {
      setTimeout(() => {
        if (this.playing) {
          this.triggerPositionUpdate();
        }
      }, 800);
    }
  }
}

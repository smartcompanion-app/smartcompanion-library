import { Prop, State } from '@stencil/core';
import { AudioPlayerUpdate, ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';

export const audioPlayerBaseComponentFactory = (Base) => {
  class AudioPlayerBaseComponent extends Base {

    @State() playing: boolean = false;
    @State() position = 0;
    @State() duration = 0;
    @State() activeIndex = 0;
    @State() earpiece = false;

    @Prop() facade: ServiceFacade;

    /**
     * Initialize earpiece/speaker state from local storage
     * Should be called in componentWillLoad() lifecycle method
     */
    async initEarpiece() {
      this.earpiece = window.localStorage.getItem('audio-earpiece') == 'yes' ? true : false;
    }

    /**
     * Initialize eaudio player with given stations
     * Should be called in componentDidLoad() lifecycle method
     */
    async initAudioPlayer(stations: Array<Station>) {
      await this.facade.getAudioPlayerService().start(stations);

      if (this.earpiece) {
        await this.facade.getAudioPlayerService().setEarpiece();
      } else {
        await this.facade.getAudioPlayerService().setSpeaker();
      }
  
      this.facade.getAudioPlayerService().registerUpdateListener(async (update: AudioPlayerUpdate) => {
        if (update.state == 'playing') {
          this.playing = true;
          this.updatePosition();
        } else if (update.state == 'paused') {
          this.playing = false;
        } else if (update.state == 'skip') {
          this.activeIndex = update.index;
          await this.onSkip(update);
          await this.resetAudioPlayer();
        } else if (update.state == "completed") {
          await this.onCompleted(update);
        } else if (update.state == "collected") {
          const stationId = this.facade.getAudioPlayerService().getStationId(update.index);

          const station = await this
            .facade
            .getStationService()
            .updateCollectedPercentage(
              stationId,
              update.id,
              update.percentage
            );

          await this.onCollected(update, station);
        }
      });
  
      await this.facade.getAudioPlayerService().select(this.activeIndex);
      await this.resetAudioPlayer();
    }

    /**
     * Destroy audio player and unregister update listener
     * Should be called in disconnectedCallback() lifecycle method
     */
    async destroyAudioPlayer() {
      this.playing = false;
      await this.facade.getAudioPlayerService().stop();
      this.facade.getAudioPlayerService().unregisterUpdateListener();
    }

    async resetAudioPlayer() {
      this.playing = false;
      this.position = 0;
      this.duration = await this.facade.getAudioPlayerService().getDuration();
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
      this.position = position;
      await this.facade.getAudioPlayerService().seek(position);
      await this.facade.getAudioPlayerService().play();
    }

    updateActiveIndex(id: string, stations: Array<Station>) {
      const items = this.facade.getAudioPlayerService().getPlayerItems(stations);
      this.activeIndex = this.facade.getAudioPlayerService().getIndexByStationId(id, items);
    }

    async toggleOutput() {
      if (this.earpiece) {
        await this.facade.getAudioPlayerService().setSpeaker();
      } else {
        await this.facade.getAudioPlayerService().setEarpiece();
      }
      this.earpiece = !this.earpiece;
      window.localStorage.setItem('audio-earpiece', this.earpiece ? 'yes' : 'no');
    }

    /**
     * Override this method to handle 'skip' event from audio player
     */
    async onSkip(_: AudioPlayerUpdate) {}

    /**
     * Override this method to handle 'complete' event from audio player
     */
    async onCompleted(_: AudioPlayerUpdate) {
      await this.facade.getAudioPlayerService().pause();
      await this.facade.getAudioPlayerService().seek(0);
      this.position = 0;
    }

    /**
     * Override this method to handle 'collected' event from audio player
     */
    async onCollected(_: AudioPlayerUpdate, __: Station) {}

    async updatePosition() {
      this.position = await this.facade.getAudioPlayerService().getPosition();
      this.duration = await this.facade.getAudioPlayerService().getDuration();

      if (this.duration > 0 && this.position < this.duration) {
        setTimeout(() => {
          if (this.playing) {
            this.updatePosition();
          }
        }, 800);
      }
    } 
  }

  return AudioPlayerBaseComponent;
}

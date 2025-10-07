import { Component, State, Prop, Host, h } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { ServiceFacade, AudioPlayerUpdate } from '@smartcompanion/services';
import { formatSeconds } from '../../utils';

@Component({
  tag: 'sc-page-multi-audio-station',
  styleUrl: 'page-multi-audio-station.scss'
})
export class PageMultiAudioStation {

  /** Audio Player Mixin */
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
  async onSkip(_: AudioPlayerUpdate) { }

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
  async onCollected(_: AudioPlayerUpdate, __: Station) { }

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
  /** End Audio Player Mixin */

  @State() station: Station;

  /**
   * Define default back button href, only used if enableBackButton is true
   */
  @Prop() defaultBackButtonHref: string = null;

  /**
   * If tour id is given, stations are retrieved from specific tour.
   * Tour id 'default' is a placeholder for the default tour id.
   */
  @Prop() tourId: string = null;

  /**
   * The ID of the active station to display
   */
  @Prop() stationId: string;

  /**
   * This prop displays a button for switching audio output between speaker and earpiece.
   * This feature is only available on hybrid apps
   */
  @Prop() enableSwitchAudioOutput: boolean = false;

  async componentWillLoad() {
    await this.facade.getMenuService().enable();
    this.station = await this.facade.getStationService().getStation(this.stationId);
    this.initEarpiece();
  }

  async componentDidLoad() {
    await this.initAudioPlayer([this.station]);
  }

  async disconnectedCallback() {
    await this.destroyAudioPlayer();
  }

  render() {
    return (
      <Host id="multi-audio-station">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button text="" defaultHref={this.defaultBackButtonHref}></ion-back-button>
            </ion-buttons>
            <ion-title>
              <div class="station-title">
                <sc-station-icon size="small">{this.station.number}</sc-station-icon>
                <span>{this.station.title}</span>
                <span class="station-subtitle">{this.station.subtitle}</span>
              </div>
            </ion-title>
            <ion-buttons slot="end">
              <ion-button id="click-trigger">
                <ion-icon name="ellipsis-vertical"></ion-icon>
              </ion-button>
              <ion-popover trigger="click-trigger" trigger-action="click">
                <ion-content class="ion-padding">
                  <h4>{this.station.title}</h4>
                  <p>{this.station.description}</p>
                </ion-content>
              </ion-popover>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-no-padding">
          {this.enableSwitchAudioOutput && (
            <ion-fab vertical="top" horizontal="end" slot="fixed">
              <ion-fab-button color="primary" size="small" onClick={() => this.toggleOutput()}>
                {this.earpiece ?
                  <ion-icon name="volume-medium-outline"></ion-icon> :
                  <ion-icon src="assets/earpiece.svg"></ion-icon>
                }
              </ion-fab-button>
            </ion-fab>
          )}
          <section id="station">
            <sc-image-slideshow images={this.station.images.map(image => image.internalWebUrl)}></sc-image-slideshow>

            <div id="station-player-controls">
              <sc-player-controls
                playing={this.playing}
                position={this.position}
                duration={this.duration}
                onNext={() => this.next()}
                onPrev={() => this.prev()}
                onPlayPause={() => this.playPause()}
                onStartPositionChange={() => this.startPositionChange()}
                onEndPositionChange={(e) => this.changePosition(e.detail)}
              />
            </div>

            <div class="station-audios">
              <ion-card>
                <ion-list>
                  {this.station.audios.map((audio, audioIndex) => (
                    <ion-item
                      data-testid={`audio-item-${audioIndex}`}
                      onClick={() => this.select(audioIndex)}
                      lines="none"
                      class={this.activeIndex == audioIndex ? 'active' : ''}>
                      <ion-icon slot="start" name="play"></ion-icon>
                      <ion-label>
                        <sc-marquee active={this.playing && this.activeIndex == audioIndex}>{audio.title}</sc-marquee>
                      </ion-label>
                      <p slot="end">{formatSeconds(audio.duration)}</p>
                    </ion-item>
                  ))}
                </ion-list>
              </ion-card>
            </div>
          </section>
        </ion-content>
      </Host>
    );
  }
}

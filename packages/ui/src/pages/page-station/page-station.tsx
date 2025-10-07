import { Component, State, Prop, Host, h } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { AudioPlayerUpdate, ServiceFacade } from '@smartcompanion/services';
import { getMenuButton, getStations } from '../../utils';

@Component({
  tag: 'sc-page-station',
  styleUrl: 'page-station.scss',
})
export class PageStation {

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

  async toggleOutput() {
    if (this.earpiece) {
      await this.facade.getAudioPlayerService().setSpeaker();
    } else {
      await this.facade.getAudioPlayerService().setEarpiece();
    }
    this.earpiece = !this.earpiece;
    window.localStorage.setItem('audio-earpiece', this.earpiece ? 'yes' : 'no');
  }

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

  @State() stations: Array<Station> = [];

  /**
   * Enable Back Button instead of Menu Button
   */
  @Prop() enableBackButton: boolean = false;

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
    this.stations = await getStations(this.facade, this.tourId);

    // if a stationId is given from URL, then search corresponding activeIndex
    if (this.stationId) {
      this.activeIndex = this.facade.getAudioPlayerService().getIndexByStationId(this.stationId);
    }

    this.initEarpiece();
  }

  async componentDidLoad() {
    this.initAudioPlayer(this.stations);
  }

  async disconnectedCallback() {
    this.destroyAudioPlayer();
  }

  render() {
    return (
      <Host id="station">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-buttons slot="start">
              {getMenuButton(this.enableBackButton, this.defaultBackButtonHref, { "color": "secondary" })}
            </ion-buttons>
            <ion-buttons slot="end">
              {this.enableSwitchAudioOutput && (
                <ion-fab-button color="light" size="small" onClick={() => this.toggleOutput()}>
                  {this.earpiece ?
                    <ion-icon color="primary" name="volume-medium-outline"></ion-icon> :
                    <ion-icon color="primary" src="assets/earpiece.svg"></ion-icon>
                  }
                </ion-fab-button>
              )}
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen={true}>
          <ion-img class="station-image" src={this.stations[this.activeIndex].images[0]['internalWebUrl']}></ion-img>

          <div class="station-player">
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

          <ion-grid class="station-content">
            <ion-row>
              <ion-col size="2">
                <sc-station-icon size="large">{this.stations[this.activeIndex].number}</sc-station-icon>
              </ion-col>
              <ion-col size="10">
                <div style={{ "padding-right": "25px" }}>
                  <h1>{this.stations[this.activeIndex].title}</h1>
                  <p class="subtitle">{this.stations[this.activeIndex].subtitle}</p>
                  <p class="description">{this.stations[this.activeIndex].description}</p>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </Host>
    );
  }
}

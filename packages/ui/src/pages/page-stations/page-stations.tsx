import { Component, h, State, Prop } from '@stencil/core';
import { Swiper } from 'swiper';
import { Asset, Station } from '@smartcompanion/data';
import { AudioPlayerUpdate, ServiceFacade } from '@smartcompanion/services';
import { getSortedStations } from '../../utils';

@Component({
  tag: 'sc-page-stations',
  styleUrl: 'page-stations.scss',
})
export class PageStations {

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

  protected playerList: Swiper;
  protected restartPlaying = false;

  @State() stations: Array<Station> = [];

  /**
   * If tour id is given, stations are retrieved from specific tour.
   * Tour id 'default' is a placeholder for the default tour id.
   */
  @Prop() tourId: string = null;

  /**
   * The ID of the initial active station to display, if set to null, the first station will be displayed
   */
  @Prop() stationId: string = null;

  async componentWillLoad() {
    this.facade.getMenuService().enable();
    this.stations = await getSortedStations(this.facade, this.tourId);
    this.updateActiveIndex(this.stationId, this.stations);
    this.initEarpiece();
  }

  async componentDidLoad() {
    this.playerList = new Swiper('#player-list', {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: true,
    });

    await this.initAudioPlayer(this.stations);
    this.playerList.slideTo(this.activeIndex);
  }

  async disconnectedCallback() {
    this.destroyAudioPlayer();
  }

  getImageUri(index: number, imageIndex: number = 0) {
    const station = this.stations[index];
    return (station.images[imageIndex] as Asset).internalWebUrl;
  }

  openMenu() {
    this.facade.getMenuService().open();
  }

  async onCompleted(_: AudioPlayerUpdate) {
    await this.next();
  }

  async onSkip(_: AudioPlayerUpdate) {
    this.playerList.slideTo(this.activeIndex);
  }

  async onCollected(_: AudioPlayerUpdate, updatedStation: Station) {
    this.stations = this.stations.map(s => s.id === updatedStation.id ? updatedStation : s);
  }

  render() {
    return [
      <ion-header class="ion-no-border">
        <ion-toolbar class="ion-hide-md-up">
          <ion-buttons slot="start">
            <ion-fab-button color="light" size="small" onClick={() => this.openMenu()}>
              <ion-icon color="primary" name="menu-outline"></ion-icon>
            </ion-fab-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content id="home" fullscreen={true}>
        <div id="player-main">
          <div id="player-image">
            <img src={this.getImageUri(this.activeIndex)} />
          </div>
          <div id="player">
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
          <div id="player-list" class="swiper">
            <div class="swiper-wrapper">
              {this.stations.map((station, index) =>
                <div data-testid={`player-list-item-${index}`} class={this.activeIndex == index ? 'swiper-slide active' : 'swiper-slide'}>
                  <ion-card button onClick={() => { this.select(index) }}>
                    <div class="card-content">
                      <img src={this.getImageUri(index, 1)} />
                      <div class="card-content-text">
                        <sc-station-icon collectedPercent={station.collectedPercentage * 100}>{station.number}</sc-station-icon>
                        {station.subtitle && <p class="subtitle">{station.subtitle}</p>}
                        <p class="title">{station.title}</p>
                      </div>
                    </div>
                  </ion-card>
                </div>
              )}
            </div>
          </div>
        </div>
      </ion-content>
    ];
  }
}

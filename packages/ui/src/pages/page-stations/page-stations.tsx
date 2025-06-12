import { Component, h, State, Prop } from '@stencil/core';
import Swiper from 'swiper';
import { Asset, Station } from '@smartcompanion/data';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-stations',
  styleUrl: 'page-stations.scss',
})
export class PageStations {

  protected playerList: Swiper;
  protected restartPlaying = false;

  @Prop() facade: ServiceFacade;

  @State() stations: Station[] = [];
  @State() duration: number = 0; // seconds
  @State() position: number = 0; // seconds
  @State() playing: boolean = false;
  @State() earpiece: boolean = false;

  @Prop({mutable: true, reflect: true}) stationIndex: number;

  async componentWillLoad() {    
    this.stations = await this
      .facade
      .repository('stations')
      .getStations();
  }

  async componentDidLoad() {    
    this.playerList = new Swiper('#player-list', {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: true,
    });
    this.playerList.slideTo(this.stationIndex);

    await this.facade.audio().start(this.stations);
    await this.facade.audio().setSpeaker();

    this.facade.audio().registerUpdateListener(async (update) => {
      if (update.state == 'skip') {
        this.playing = false;
        this.stationIndex = update.index;
        await this.initPlayer();
      } else if (update.state == 'playing') {
        this.stationIndex = update.index;
        this.playing = true;        
        this.updatePosition();
      } else if (update.state == 'paused') {
        this.stationIndex = update.index;
        this.playing = false;        
      } else if (update.state == "collected") {
        const station = await this
          .facade
          .repository('stations')
          .updateCollectedPercentage(
            this.stations[this.stationIndex].id,
            update.id,
            update.percentage
          );
        this.stations = [
          ...this.stations.slice(0, this.stationIndex),
          station,
          ...this.stations.slice(this.stationIndex + 1)  
        ];
      }
    });
    
    if (this.stationIndex > 0) { // set index to player
      await this.facade.audio().select(this.stationIndex);
    }

    await this.initPlayer();
  }

  async disconnectedCallback() {
    await this.facade.audio().stop();
    this.facade.audio().unregisterUpdateListener();
  }

  async initPlayer() {
    this.playerList.slideTo(this.stationIndex);
    this.position = 0;
    this.duration = await this
      .facade
      .audio()
      .getDuration();
  }

  getImageUri(stationIndex: number, imageIndex: number = 0) {
    const station = this.stations[stationIndex];
    return (station.images[imageIndex] as Asset).internalWebUrl;
  }

  async next() {
    await this.facade.audio().next();
  }

  async prev() {
    await this.facade.audio().prev();
  }

  async playPause() {
    if (this.playing) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async play() {
    await this.facade.audio().play();
  }

  async pause() {
    await this.facade.audio().pause();
  }

  async select(index: number) {
    await this.facade.audio().select(index);
  }

  async updatePosition() {
    this.position = await this.facade.audio().getPosition();
    this.duration = await this.facade.audio().getDuration();

    if (this.duration > 0 && this.position >= (this.duration - 1)) {
      setTimeout(() => this.next(), 1000);
    } else {
      setTimeout(() => {
        if (this.playing) {
          this.updatePosition();
        }
      }, 800);
    }
  }

  openMenu() {
    this.facade.menu().open();
  }

  toggleOutput() {
    if (this.earpiece) {
      this.facade.audio().setSpeaker();
      this.earpiece = false;
    } else {
      this.facade.audio().setEarpiece();
      this.earpiece = true;
    }
  }

  async startPositionChange() {
    await this.facade.audio().pause();
  }

  async changePosition(position: number) {
    this.position = position;
    await this.facade.audio().seek(position);
    await this.facade.audio().play();
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
          <ion-buttons slot="end">
            <ion-fab-button color="light" size="small" onClick={() => this.toggleOutput()}>
              {this.earpiece ?
                <ion-icon color="primary" name="volume-medium-outline"></ion-icon> :
                <ion-icon src="../../assets/icon/earpiece.svg"></ion-icon>
              }
            </ion-fab-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content id="home" fullscreen={true}>
        <div id="player-main">
          <div id="player-image">
            <img src={this.getImageUri(this.stationIndex)} />
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
                <div class={this.stationIndex == index ? 'swiper-slide active' : 'swiper-slide'}>
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

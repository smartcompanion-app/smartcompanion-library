import { Component, h, State, Prop, Mixin } from '@stencil/core';
import { Swiper } from 'swiper';
import { Asset, Station } from '@smartcompanion/data';
import { audioPlayerBaseComponentFactory, getSortedStations } from '../../utils';
import { AudioPlayerUpdate } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-stations',
  styleUrl: 'page-stations.scss',
})
export class PageStations extends Mixin(audioPlayerBaseComponentFactory) {

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

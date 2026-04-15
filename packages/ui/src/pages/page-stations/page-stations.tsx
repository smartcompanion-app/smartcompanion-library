import { Component, h, State, Prop } from '@stencil/core';
import { Swiper } from 'swiper';
import { Asset, Station } from '@smartcompanion/data';
import { AudioPlayerUpdate, ServiceFacade } from '@smartcompanion/services';
import { getSortedStations, ReactiveAudioPlayer } from '../../utils';

@Component({
  tag: 'sc-page-stations',
  styleUrl: 'page-stations.scss',
})
export class PageStations {

  protected playerList: Swiper;
  protected reactiveAudioPlayer: ReactiveAudioPlayer;
  protected restartPlaying = false;

  @State() stations: Array<Station> = [];
  @State() playing: boolean = false;
  @State() position = 0;
  @State() duration = 0;
  @State() activeIndex = 0;
  @State() earpiece = false;

  /**
   * If tour id is given, stations are retrieved from specific tour.
   * Tour id 'default' is a placeholder for the default tour id.
   */
  @Prop() tourId: string = null;

  /**
   * The ID of the initial active station to display, if set to null, the first station will be displayed
   */
  @Prop() stationId: string = null;

  /**
   * This prop displays a button for switching audio output between speaker and earpiece.
   * This feature is only available on hybrid apps
   */
  @Prop() enableSwitchAudioOutput: boolean = false;

  /**
   * Provides access to all services via the service facade
   */
  @Prop() facade: ServiceFacade;

  async componentWillLoad() {
    this.reactiveAudioPlayer = new ReactiveAudioPlayer(this);
   
    this.reactiveAudioPlayer.setOnCompletedListener(async (_: AudioPlayerUpdate) => {
      await this.reactiveAudioPlayer.next();
    });
    this.reactiveAudioPlayer.setOnCollectedListener(async (_: AudioPlayerUpdate, updatedStation: Station) => {
      this.stations = this.stations.map(s => s.id === updatedStation.id ? updatedStation : s);
    });
    this.reactiveAudioPlayer.setOnSkipListener(async (_: AudioPlayerUpdate) => {
      this.playerList?.slideTo(this.activeIndex);
    });

    this.facade.getMenuService().enable();
    this.stations = await getSortedStations(this.facade, this.tourId);
    this.reactiveAudioPlayer.updateActiveIndexByStationId(this.stationId, this.stations);
  }

  async componentDidLoad() {
    this.playerList = new Swiper('#player-list', {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: true,
    });

    await this.reactiveAudioPlayer.initAudioPlayer(this.stations);
    this.playerList.slideTo(this.activeIndex);
  }

  async disconnectedCallback() {
    this.reactiveAudioPlayer?.destroyAudioPlayer();
    this.reactiveAudioPlayer = null;
  }

  private getImageUri(index: number, imageIndex: number = 0) {
    const station = this.stations[index];
    return (station.images[imageIndex] as Asset).internalWebUrl;
  }

  private openMenu = () => {
    this.facade.getMenuService().open();
  };

  private handleToggleOutput = () => {
    this.reactiveAudioPlayer.toggleOutput();
  };

  private handleNext = () => {
    this.reactiveAudioPlayer.next();
  };

  private handlePrev = () => {
    this.reactiveAudioPlayer.prev();
  };

  private handlePlayPause = () => {
    this.reactiveAudioPlayer.playPause();
  };

  private handleStartPositionChange = () => {
    this.reactiveAudioPlayer.startPositionChange();
  };

  private handleEndPositionChange = (e: CustomEvent<number>) => {
    this.reactiveAudioPlayer.changePosition(e.detail);
  };

  private handleSelect = (e: Event) => {
    const index = parseInt((e.currentTarget as HTMLElement).dataset.index);
    this.reactiveAudioPlayer.select(index);
  };

  render() {
    return [
      <ion-header class="ion-no-border">
        <ion-toolbar class="ion-hide-md-up">
          <ion-buttons slot="start">
            <ion-fab-button color="light" size="small" onClick={this.openMenu}>
              <ion-icon color="primary" name="menu-outline"></ion-icon>
            </ion-fab-button>
          </ion-buttons>
          <ion-buttons slot="end">
            {this.enableSwitchAudioOutput && (
              <ion-fab-button color="light" size="small" onClick={this.handleToggleOutput}>
                {this.earpiece ?
                  <ion-icon color="primary" name="volume-medium-outline"></ion-icon> :
                  <ion-icon color="primary" src="assets/earpiece.svg"></ion-icon>
                }
              </ion-fab-button>
            )}
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
              onNext={this.handleNext}
              onPrev={this.handlePrev}
              onPlayPause={this.handlePlayPause}
              onStartPositionChange={this.handleStartPositionChange}
              onEndPositionChange={this.handleEndPositionChange}
            />
          </div>
          <div id="player-list" class="swiper">
            <div class="swiper-wrapper">
              {this.stations.map((station, index) =>
                <div data-testid={`player-list-item-${index}`} class={this.activeIndex == index ? 'swiper-slide active' : 'swiper-slide'}>
                  <ion-card button data-index={index} onClick={this.handleSelect}>
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

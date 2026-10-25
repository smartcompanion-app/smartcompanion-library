import { Component, h, State, Prop, Host } from '@stencil/core';
import { Swiper } from 'swiper';
import { Asset, Station } from '@smartcompanion/data';
import { AudioPlayerUpdate, PageStationFacade } from '../../contracts';
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
  /** Index of the active station in the list, which is not its index in the player */
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
  @Prop() facade: PageStationFacade;

  async componentWillLoad() {
    this.reactiveAudioPlayer = new ReactiveAudioPlayer(this);

    this.reactiveAudioPlayer.setOnCompletedListener(async (_: AudioPlayerUpdate) => {
      await this.reactiveAudioPlayer.next();
    });
    this.reactiveAudioPlayer.setOnCollectedListener(async (_: AudioPlayerUpdate, updatedStation: Station) => {
      this.stations = this.stations.map(s => (s.id === updatedStation.id ? updatedStation : s));
    });
    this.reactiveAudioPlayer.setOnSkipListener(async (_: AudioPlayerUpdate) => {
      this.playerList?.slideTo(this.activeIndex);
    });

    this.facade.getMenuService().enable();
    this.stations = await getSortedStations(this.facade, this.tourId);

    // The player's index counts audios: a station with several has several, one without audio
    // none. The page's activeIndex counts stations, so it is set here and from now on mapped
    // through the station id of what the player reports
    const activeIndex = Math.max(
      this.stations.findIndex(station => station.id == this.stationId),
      0,
    );
    this.reactiveAudioPlayer.updateActiveIndexByStationId(this.stations[activeIndex]?.id, this.stations);
    this.activeIndex = activeIndex;
    this.reactiveAudioPlayer.setOnActiveIndexUpdateListener((audioIndex: number) => {
      const stationId = this.facade.getAudioPlayerService().getStationId(audioIndex);
      const stationIndex = this.stations.findIndex(station => station.id == stationId);
      if (stationIndex >= 0) {
        this.activeIndex = stationIndex;
      }
    });
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

  /**
   * A station with a single image shows it in both places
   */
  private getImageUri(index: number, imageIndex: number = 0) {
    const images = this.stations[index].images as Asset[];
    return (images[imageIndex] ?? images[0])?.internalWebUrl;
  }

  private hasAudio(index: number) {
    return this.stations[index]?.audios?.length > 0;
  }

  /**
   * Selects the audio at the given index in the player, which then reports its station as active
   */
  private async selectAudio(audioIndex: number) {
    if (audioIndex >= 0) {
      await this.reactiveAudioPlayer.select(audioIndex);
    }
  }

  /**
   * A station without audio has no item in the player to select, so the page
   * activates it itself, and pauses the audio of the station it leaves
   */
  private async selectStationWithoutAudio(index: number) {
    this.activeIndex = index;
    this.playerList?.slideTo(index);
    if (this.playing) {
      await this.reactiveAudioPlayer.pause();
    }
  }

  private openMenu = () => {
    this.facade.getMenuService().open();
  };

  private handleToggleOutput = () => {
    this.reactiveAudioPlayer.toggleOutput();
  };

  private handleNext = () => {
    if (this.hasAudio(this.activeIndex)) {
      this.reactiveAudioPlayer.next();
    } else {
      this.selectAudio(this.facade.getAudioPlayerService().getNextIndexByStationId(this.stations[this.activeIndex].id, this.stations));
    }
  };

  private handlePrev = () => {
    if (this.hasAudio(this.activeIndex)) {
      this.reactiveAudioPlayer.prev();
    } else {
      this.selectAudio(this.facade.getAudioPlayerService().getPrevIndexByStationId(this.stations[this.activeIndex].id, this.stations));
    }
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
    if (this.hasAudio(index)) {
      this.selectAudio(this.facade.getAudioPlayerService().getIndexByStationId(this.stations[index].id));
    } else {
      this.selectStationWithoutAudio(index);
    }
  };

  render() {
    const hasAudio = this.hasAudio(this.activeIndex);

    return (
      <Host>
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
                  {this.earpiece ? <ion-icon color="primary" name="volume-medium-outline"></ion-icon> : <ion-icon color="primary" src="assets/earpiece.svg"></ion-icon>}
                </ion-fab-button>
              )}
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content id="home" fullscreen={true}>
          <div id="player-main">
            <div id="player-image">
              <img src={this.getImageUri(this.activeIndex)} />
            </div>
            <div id="player">
              <sc-player-controls
                playing={this.playing}
                position={hasAudio ? this.position : 0}
                duration={hasAudio ? this.duration : 0}
                disabled={!hasAudio}
                onNext={this.handleNext}
                onPrev={this.handlePrev}
                onPlayPause={this.handlePlayPause}
                onStartPositionChange={this.handleStartPositionChange}
                onEndPositionChange={this.handleEndPositionChange}
              />
            </div>
            <div id="player-list" class="swiper">
              <div class="swiper-wrapper">
                {this.stations.map((station, index) => (
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
                ))}
              </div>
            </div>
          </div>
        </ion-content>
      </Host>
    );
  }
}

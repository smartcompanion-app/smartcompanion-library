import { Component, State, Prop, Host, h } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { getMenuButton, getStations, ReactiveAudioPlayer } from '../../utils';
import { PageStationFacade } from '../../contracts';

@Component({
  tag: 'sc-page-station',
  styleUrl: 'page-station.scss',
})
export class PageStation {
  protected reactiveAudioPlayer: ReactiveAudioPlayer;

  @State() stations: Array<Station> = [];
  @State() playing: boolean = false;
  @State() position = 0;
  @State() duration = 0;
  /** Index of the active station, which is not its index in the player */
  @State() activeIndex = 0;
  @State() earpiece = false;

  /**
   * Enable Back Button instead of Menu Button
   */
  @Prop() enableBackButton: boolean = false;

  /**
   * Where the back button goes when there is no previous page to return to,
   * e.g. after opening a deep link. Defaults to `/`. Only used if
   * enableBackButton is true
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

  /**
   * Provides access to all services via the service facade
   */
  @Prop() facade: PageStationFacade;

  async componentWillLoad() {
    this.reactiveAudioPlayer = new ReactiveAudioPlayer(this);

    await this.facade.getMenuService().enable();
    this.stations = await getStations(this.facade, this.tourId);

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
    await this.reactiveAudioPlayer.initAudioPlayer(this.stations);
  }

  async disconnectedCallback() {
    this.reactiveAudioPlayer?.destroyAudioPlayer();
    this.reactiveAudioPlayer = null;
  }

  private handleToggleOutput = () => {
    this.reactiveAudioPlayer.toggleOutput();
  };

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

  // A station without audio has no item in the player to go on from
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

  private handleBack = () => {
    this.facade.getRoutingService().back(this.defaultBackButtonHref || undefined);
  };

  render() {
    const hasAudio = this.hasAudio(this.activeIndex);

    return (
      <Host id="station">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-buttons slot="start">{getMenuButton(this.enableBackButton, this.handleBack, { color: 'secondary' })}</ion-buttons>
            <ion-buttons slot="end">
              {this.enableSwitchAudioOutput && (
                <ion-fab-button color="light" size="small" onClick={this.handleToggleOutput}>
                  {this.earpiece ? <ion-icon color="primary" name="volume-medium-outline"></ion-icon> : <ion-icon color="primary" src="assets/earpiece.svg"></ion-icon>}
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

          <ion-grid class="station-content">
            <ion-row>
              <ion-col size="2">
                <sc-station-icon size="large">{this.stations[this.activeIndex].number}</sc-station-icon>
              </ion-col>
              <ion-col size="10">
                <div style={{ 'padding-right': '25px' }}>
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

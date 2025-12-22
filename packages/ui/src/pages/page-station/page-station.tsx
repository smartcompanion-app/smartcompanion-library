import { Component, State, Prop, Host, h } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { getMenuButton, getStations, ReactiveAudioPlayer } from '../../utils';
import { ServiceFacade } from '@smartcompanion/services';

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
  @State() activeIndex = 0;
  @State() earpiece = false;

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

  /**
   * Provides access to all services via the service facade
   */
  @Prop() facade: ServiceFacade;
 
  async componentWillLoad() {
    this.reactiveAudioPlayer = new ReactiveAudioPlayer(this);
    await this.facade.getMenuService().enable();
    this.stations = await getStations(this.facade, this.tourId);
    this.reactiveAudioPlayer.updateActiveIndexByStationId(this.stationId, this.stations);
  }

  async componentDidLoad() {
    await this.reactiveAudioPlayer.initAudioPlayer(this.stations);
  }

  async disconnectedCallback() {
    this.reactiveAudioPlayer?.destroyAudioPlayer();
    this.reactiveAudioPlayer = null;
  }

  render() {
    return (
      <Host id="station">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-buttons slot="start">
              {getMenuButton(this.enableBackButton, this.defaultBackButtonHref, {"color": "secondary"})}
            </ion-buttons>
            <ion-buttons slot="end">
              {this.enableSwitchAudioOutput && (
                <ion-fab-button color="light" size="small" onClick={() => this.reactiveAudioPlayer.toggleOutput()}>
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
              onNext={() => this.reactiveAudioPlayer.next()}
              onPrev={() => this.reactiveAudioPlayer.prev()}
              onPlayPause={() => this.reactiveAudioPlayer.playPause()}
              onStartPositionChange={() => this.reactiveAudioPlayer.startPositionChange()}
              onEndPositionChange={(e) => this.reactiveAudioPlayer.changePosition(e.detail)}
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

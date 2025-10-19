import { Component, State, Prop, Host, Mixin, h } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { getMenuButton, getStations } from '../../utils';
import { audioPlayerBaseComponentFactory } from '../../utils/audio-player-base-component';

@Component({
  tag: 'sc-page-station',
  styleUrl: 'page-station.scss',
})
export class PageStation extends Mixin(audioPlayerBaseComponentFactory) {

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
    this.updateActiveIndex(this.stationId, this.stations);
    this.initEarpiece();
  }

  async componentDidLoad() {
    await this.initAudioPlayer(this.stations);
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
              {getMenuButton(this.enableBackButton, this.defaultBackButtonHref, {"color": "secondary"})}
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

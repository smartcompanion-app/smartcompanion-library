import { Component, State, Prop, Host, h } from '@stencil/core';
import { AudioPlayerUpdate } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { ServiceFacade } from '@smartcompanion/services';
import { getMenuButton, getStations } from '../../utils';

@Component({
  tag: 'sc-page-station',
  styleUrl: 'page-station.scss',
})
export class PageStation {

  @State() stations: Array<Station> = [];
  @State() audio: any;
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

  @Prop() facade: ServiceFacade;

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
      this.activeIndex = this.facade.getAudioPlayerService().getIndex(this.stationId, this.stations);
    }
  }

  async componentDidLoad() {
    await this.facade.getAudioPlayerService().start(this.stations);
    await this.facade.getAudioPlayerService().setSpeaker();

    this.facade.getAudioPlayerService().registerUpdateListener(async (update: AudioPlayerUpdate) => {
      if (update.state == 'playing') {
        this.playing = true;
        this.updatePosition();
      } else if (update.state == 'paused') {
        this.playing = false;
      } else if (update.state == 'skip') {
        this.activeIndex = update.index;
        this.playing = false;
        this.position = 0;
        this.duration = await this.facade.getAudioPlayerService().getDuration();
      } else if (update.state == "completed") {
        await this.completed();
      }
    });

    await this.facade.getAudioPlayerService().select(this.activeIndex);
  }

  async disconnectedCallback() {
    await this.facade.getAudioPlayerService().stop();
    this.facade.getAudioPlayerService().unregisterUpdateListener();
  }

  async next() {
    await this.facade.getAudioPlayerService().next();
  }

  async prev() {
    await this.facade.getAudioPlayerService().prev();
  }

  async completed() {
    await this.facade.getAudioPlayerService().pause();
    await this.facade.getAudioPlayerService().seek(0);
    this.position = 0;
  }

  async startPositionChange() {
    await this.facade.getAudioPlayerService().pause();
  }

  async changePosition(position: number) {
    this.position = position;
    await this.facade.getAudioPlayerService().seek(position);
    await this.facade.getAudioPlayerService().play();
  }

  async updatePosition() {
    this.position = await this.facade.getAudioPlayerService().getPosition();
    this.duration = await this.facade.getAudioPlayerService().getDuration();

    if (this.duration > 0 && this.position >= (this.duration - 1)) {
      await this.completed();
    } else {
      setTimeout(() => {
        if (this.playing) {
          this.updatePosition();
        }
      }, 800);
    }
  }

  async toggleOutput() {
    if (this.earpiece) {
      await this.facade.getAudioPlayerService().setSpeaker();
    } else {
      await this.facade.getAudioPlayerService().setEarpiece();
    }
    this.earpiece = !this.earpiece;
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
              onPlayPause={() => this.playing ? this.facade.getAudioPlayerService().pause() : this.facade.getAudioPlayerService().play()}
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

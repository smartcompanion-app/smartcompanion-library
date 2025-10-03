import { Component, State, Prop, Host, Mixin, h } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { audioPlayerBaseComponentFactory, formatSeconds } from '../../utils';

@Component({
  tag: 'sc-page-multi-audio-station',
  styleUrl: 'page-multi-audio-station.scss'
})
export class PageMultiAudioStation extends Mixin(audioPlayerBaseComponentFactory) {

  @State() station: Station;

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
    this.station = await this.facade.getStationService().getStation(this.stationId);
    this.initEarpiece();
   }

  async componentDidLoad() {
    await this.initAudioPlayer([this.station]);
  }

  async disconnectedCallback() {
    await this.destroyAudioPlayer();  
  }

  render() {
    return (
      <Host id="multi-audio-station">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button text="" defaultHref={this.defaultBackButtonHref}></ion-back-button>
            </ion-buttons>
            <ion-title>
              <div class="station-title">
                <sc-station-icon size="small">{this.station.number}</sc-station-icon>
                <span>{this.station.title}</span>
                <span class="station-subtitle">{this.station.subtitle}</span>
              </div>
            </ion-title>
            <ion-buttons slot="end">
              <ion-button id="click-trigger">
                <ion-icon name="ellipsis-vertical"></ion-icon>
              </ion-button>
              <ion-popover trigger="click-trigger" trigger-action="click">
                <ion-content class="ion-padding">
                  <h4>{this.station.title}</h4>
                  <p>{this.station.description}</p>
                </ion-content>
              </ion-popover>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-no-padding">
          {this.enableSwitchAudioOutput && (
            <ion-fab vertical="top" horizontal="end" slot="fixed">
              <ion-fab-button color="primary" size="small" onClick={() => this.toggleOutput()}>
                {this.earpiece ?
                  <ion-icon name="volume-medium-outline"></ion-icon> :
                  <ion-icon src="assets/earpiece.svg"></ion-icon>
                }
              </ion-fab-button>
            </ion-fab>
          )}
          <section id="station">
            <sc-image-slideshow images={this.station.images.map(image => image.internalWebUrl)}></sc-image-slideshow>

            <div id="station-player-controls">
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

            <div class="station-audios">
              <ion-card>
                <ion-list>
                  {this.station.audios.map((audio, audioIndex) => (
                    <ion-item
                      data-testid={`audio-item-${audioIndex}`}
                      onClick={() => this.select(audioIndex)}
                      lines="none"
                      class={this.activeIndex == audioIndex ? 'active' : ''}>
                      <ion-icon slot="start" name="play"></ion-icon>
                      <ion-label>
                        <sc-marquee active={this.playing && this.activeIndex == audioIndex}>{audio.title}</sc-marquee>
                      </ion-label>
                      <p slot="end">{formatSeconds(audio.duration)}</p>
                    </ion-item>
                  ))}
                </ion-list>
              </ion-card>
            </div>
          </section>
        </ion-content>
      </Host>
    );
  }
}

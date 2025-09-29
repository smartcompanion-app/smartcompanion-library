import { Component, State, Prop, Host, h } from '@stencil/core';
import { Station } from '@smartcompanion/data';
import { AudioPlayerUpdate, ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-multi-audio-station',
  styleUrl: 'page-multi-audio-station.scss'
})
export class PageMultiAudioStation {

  @State() station: Station;
  @State() playing: boolean = false;
  @State() position = 0;
  @State() duration = 0;
  @State() activeIndex = 0;
  @State() earpiece;

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
    this.station = await this.facade.getStationService().getStation(this.stationId);
    await this.facade.getMenuService().enable();
    this.earpiece = window.localStorage.getItem('audio-earpiece') == 'yes' ? true : false;
  }

  async componentDidLoad() {
    await this.facade.getAudioPlayerService().start([this.station]);

    if (this.earpiece) {
      await this.facade.getAudioPlayerService().setEarpiece();
    } else {
      await this.facade.getAudioPlayerService().setSpeaker();
    }

    this.facade.getAudioPlayerService().registerUpdateListener(async (update: AudioPlayerUpdate) => {
      console.log('AudioPlayerUpdate', update);

      if (update.state == 'playing') {
        this.playing = true;
        this.updatePosition();
      } else if (update.state == 'paused') {
        this.playing = false;
      } else if (update.state == 'skip' && update.index != this.activeIndex) {
        this.activeIndex = update.index;
        await this.initPlayer();
      }
    });
    await this.initPlayer();
  }

  async disconnectedCallback() {
    this.playing = false;
    await this.facade.getAudioPlayerService().stop();
    this.facade.getAudioPlayerService().unregisterUpdateListener();    
  }

  async initPlayer() {
    this.playing = false;
    this.position = 0;
    this.duration = await this.facade.getAudioPlayerService().getDuration();
  }

  async next() {
    await this.facade.getAudioPlayerService().next();
  }

  async prev() {
    await this.facade.getAudioPlayerService().prev();
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

    if (this.duration > 0 && this.position >= this.duration) {
      setTimeout(() => {
        this.facade.getAudioPlayerService().pause();
        this.facade.getAudioPlayerService().seek(0);
        this.position = 0;
      }, 500);
    } else {
      setTimeout(() => {
        if (this.playing) {
          this.updatePosition();
        }
      }, 1000);
    }
  }

  async toggleOutput() {
    if (this.earpiece) {
      await this.facade.getAudioPlayerService().setSpeaker();
      this.earpiece = false;
    } else {
      await this.facade.getAudioPlayerService().setEarpiece();
      this.earpiece = true;
    }
    window.localStorage.setItem('audio-earpiece', this.earpiece ? 'yes' : 'no');
  }

  getFormattedSeconds(fullSeconds: number): string {
    fullSeconds = Math.trunc(fullSeconds);
    const minutes = Math.trunc(fullSeconds / 60);
    const seconds = fullSeconds - (minutes * 60);
    return (minutes > 9 ? minutes : ("0" + minutes)) + ":" + (seconds > 9 ? seconds : "0" + seconds);
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
                onPlayPause={() => this.playing ? this.facade.getAudioPlayerService().pause() : this.facade.getAudioPlayerService().play()}
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
                      onClick={() => this.facade.getAudioPlayerService().select(audioIndex)}
                      lines="none"
                      class={this.activeIndex == audioIndex ? 'active' : ''}>
                      <ion-icon slot="start" name="play"></ion-icon>
                      <ion-label>
                        <sc-marquee active={this.playing && this.activeIndex == audioIndex}>{audio.title}</sc-marquee>
                      </ion-label>
                      <p slot="end">{this.getFormattedSeconds(audio.duration)}</p>
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

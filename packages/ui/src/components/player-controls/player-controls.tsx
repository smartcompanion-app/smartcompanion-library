import { Component, Event, EventEmitter, Host, h, Prop } from "@stencil/core";

@Component({
  tag: 'sc-player-controls',
  styleUrl: 'player-controls.scss',
  shadow: true,
})
export class PlayerControls {

  @Prop() playing: boolean = false;
  @Prop() position: number = 0;
  @Prop() duration: number = 0;
  @Prop() disabled: boolean = false;

  @Event() prev: EventEmitter<void>;
  @Event() next: EventEmitter<void>;
  @Event() playPause: EventEmitter<boolean>;
  @Event() startPositionChange: EventEmitter<number>;
  @Event() endPositionChange: EventEmitter<number>;
  @Event() positionChange: EventEmitter<number>;

  getFormattedSeconds(fullSeconds: number): string {
    fullSeconds = Math.trunc(fullSeconds);
    const minutes = Math.trunc(fullSeconds / 60);
    const seconds = fullSeconds - (minutes * 60);
    return (minutes > 9 ? minutes : ("0" + minutes)) + ":" + (seconds > 9 ? seconds : "0" + seconds);
  }

  render() {
    return (
      <Host id="player">
        <div id="player-controls">
          <ion-fab-button onClick={() => this.prev.emit()}>
            <ion-icon name="play-skip-back"></ion-icon>
          </ion-fab-button>
          <ion-fab-button id="player-controls-play" disabled={this.disabled} onClick={() => this.playPause.emit(this.playing)}>
            <ion-icon name={this.playing ? "pause" : "play"}></ion-icon>
          </ion-fab-button>
          <ion-fab-button onClick={() => this.next.emit()}>
            <ion-icon name="play-skip-forward"></ion-icon>
          </ion-fab-button>
        </div>
        <div id="player-position">
          <ion-range
            onIonKnobMoveStart={(e) => { this.startPositionChange.emit(e.detail.value) }}
            onIonKnobMoveEnd={(e) => { this.endPositionChange.emit(e.detail.value) }}
            onChange={(e) => this.positionChange.emit(e.detail.value)}
            value={this.position}
            disabled={this.duration <= 0}
            min={0}
            max={this.duration}>
              <ion-text slot="start">{this.getFormattedSeconds(this.position)}</ion-text>
              <ion-text slot="end">{this.getFormattedSeconds(this.duration)}</ion-text>
          </ion-range>
        </div>
      </Host>
    );
  }
}
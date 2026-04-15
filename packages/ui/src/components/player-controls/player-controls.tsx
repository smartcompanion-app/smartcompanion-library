import { Component, Event, EventEmitter, Host, h, Prop } from "@stencil/core";
import { formatSeconds } from "../../utils";

@Component({
  tag: 'sc-player-controls',
  styleUrl: 'player-controls.scss',
  shadow: true,
})
export class PlayerControls {

  /** Whether audio is currently playing */
  @Prop() playing: boolean = false;
  /** Current playback position in seconds */
  @Prop() position: number = 0;
  /** Total duration of the audio in seconds */
  @Prop() duration: number = 0;
  /** Whether the controls are disabled */
  @Prop() disabled: boolean = false;

  /** Emitted when the previous button is pressed */
  @Event() prev: EventEmitter<void>;
  /** Emitted when the next button is pressed */
  @Event() next: EventEmitter<void>;
  /** Emitted when the play/pause button is pressed */
  @Event() playPause: EventEmitter<boolean>;
  /** Emitted when the user starts dragging the position slider */
  @Event() startPositionChange: EventEmitter<number>;
  /** Emitted when the user finishes dragging the position slider */
  @Event() endPositionChange: EventEmitter<number>;
  /** Emitted when the position slider value changes */
  @Event() positionChange: EventEmitter<number>;

  private handlePrev = () => {
    this.prev.emit();
  };

  private handleNext = () => {
    this.next.emit();
  };

  private handlePlayPause = () => {
    this.playPause.emit(this.playing);
  };

  private handleKnobMoveStart = (e: CustomEvent) => {
    this.startPositionChange.emit(e.detail.value);
  };

  private handleKnobMoveEnd = (e: CustomEvent) => {
    this.endPositionChange.emit(e.detail.value);
  };

  private handleChange = (e: CustomEvent) => {
    this.positionChange.emit(e.detail.value);
  };

  render() {
    return (
      <Host id="player">
        <div id="player-controls">
          <ion-fab-button data-testid="player-prev-button" onClick={this.handlePrev}>
            <ion-icon name="play-skip-back"></ion-icon>
          </ion-fab-button>
          <ion-fab-button
            id="player-controls-play"
            data-testid="player-play-button"
            disabled={this.disabled}
            onClick={this.handlePlayPause}>
            <ion-icon name={this.playing ? "pause" : "play"}></ion-icon>
          </ion-fab-button>
          <ion-fab-button data-testid="player-next-button" onClick={this.handleNext}>
            <ion-icon name="play-skip-forward"></ion-icon>
          </ion-fab-button>
        </div>
        <div id="player-position">
          <ion-range
            data-testid="player-range-slider"
            onIonKnobMoveStart={this.handleKnobMoveStart}
            onIonKnobMoveEnd={this.handleKnobMoveEnd}
            onChange={this.handleChange}
            value={this.position}
            disabled={this.duration <= 0}
            min={0}
            max={this.duration}>
              <ion-text
                data-testid="player-position"
                slot="start">{formatSeconds(this.position)}</ion-text>
              <ion-text
                data-testid="player-duration"
                slot="end">{formatSeconds(this.duration)}</ion-text>
          </ion-range>
        </div>
      </Host>
    );
  }
}
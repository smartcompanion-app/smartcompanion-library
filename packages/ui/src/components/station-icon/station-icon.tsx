import { Component, Prop, Host, h } from "@stencil/core";

const SIZE_PX = { small: 20, normal: 30, large: 40 } as const;
const STROKE_WIDTH = 3;

@Component({
  tag: 'sc-station-icon',
  styleUrl: 'station-icon.scss',
  shadow: true,
})
export class StationIcon {

  /** Upper limit percentage threshold for showing the collected icon */
  @Prop() upperLimitPercent: number = 97;

  /** Lower limit percentage threshold for starting to show the collection progress */
  @Prop() lowerLimitPercent: number = 3;

  /**
   * Toggle collected icon
   */
  @Prop() collected: boolean = false;

  /**
   * Percentage value between 0 and 100 to display status
   */
  @Prop() collectedPercent: number = 0;

  /**
   * The icon size: small, normal or large.
   */
  @Prop() size: 'small' | 'normal' | 'large' = 'normal';

  private calculatePercent() {
    if (this.collectedPercent >= this.upperLimitPercent) {
      return 100;
    } else if (this.collectedPercent <= this.lowerLimitPercent) {
      return 0;
    }
    return Math.min(this.upperLimitPercent, Math.max(this.lowerLimitPercent, this.collectedPercent));
  }

  render() {
    const outerSize = SIZE_PX[this.size];
    const radius = (outerSize - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const percent = this.calculatePercent();
    const offset = circumference - (percent / 100) * circumference;
    const center = outerSize / 2;

    return (
      <Host>
        <div class={`station-icon-wrapper station-icon-size-${this.size}`}>
          <svg class="progress-ring" width={outerSize} height={outerSize} viewBox={`0 0 ${outerSize} ${outerSize}`}>
            <circle
              class="progress-ring-track"
              cx={center} cy={center} r={radius}
              stroke-width={STROKE_WIDTH}
              fill="none"
            />
            <circle
              class="progress-ring-fill"
              cx={center} cy={center} r={radius}
              stroke-width={STROKE_WIDTH}
              fill="none"
              stroke-linecap="round"
              stroke-dasharray={circumference}
              stroke-dashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>
          <div class="station-icon">
            <slot />
            { (this.collected === true || this.collectedPercent >= this.upperLimitPercent) &&
              <div class="collected-icon animate-pop-appearance">
                <ion-icon name="checkmark"></ion-icon>
              </div>
            }
          </div>
        </div>
      </Host>
    );
  }
}
import { Component, Prop, Host, h } from "@stencil/core";

@Component({
  tag: 'sc-station-icon',
  styleUrl: 'station-icon.scss',
  shadow: true,
})
export class StationIcon {

  @Prop() upperLimitPercent: number = 97;

  /**
   * Toggle collected icon
   */
  @Prop() collected: boolean = false;

  /**
   * Percentage value between 0 and 100 to display status
   */
  @Prop() collectedPercent: number = 0;

  calculatePercent() {
    if (this.collectedPercent >= this.upperLimitPercent) {
      return 100;
    }
    return Math.min(this.upperLimitPercent, Math.max(0, this.collectedPercent));
  }

  calculateAngle(): string {
    const percent = this.calculatePercent();
    return `${percent * 3.6}deg`;
  }
  
  render() {
    return (
      <Host> 
        <div style={{'--collected-angle': this.calculateAngle() }} class="station-icon-wrapper">
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
import { Component, State, Prop, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { openStation, getStations } from '../../utils';

@Component({
  tag: 'sc-page-selection',
  styleUrl: 'page-selection.scss'
})
export class PageSelection {

  @State() input: string = "";

  @State() stations: Station[] = [];

  /**
   * Background color of the header toolbar, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';
  

  /**
   * If tour id is given, stations only for the tour are queried.
   * Tour id 'default' is a placeholder for the default tour id.
   */
  @Prop() tourId: string = null;

  /**
   * Maximum length of the input field, default to 2
   */
  @Prop() maxLength = 2;

  @Prop() facade: ServiceFacade;  

  async componentWillLoad() {
    await this.facade.getMenuService().enable();
    this.stations = await getStations(this.facade, this.tourId);
  }

  addToInput(input: string) {
    if (this.input.length >= this.maxLength) {
      this.input = this.input.slice(0, -1) + input;
    } else {
      this.input += input;
    }
  }

  clearLastInput() {
    if (this.input.length > 0) {
      this.input = this.input.slice(0, -1);
    }
  }

  async checkStation() {
    const station = this.stations.find(station => station.number == this.input);
    this.input = "";

    if (station) {
      this.openStation(station.id);
    }
  }  

  openStation(stationId: string) {
    openStation(this.facade, stationId, this.tourId);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color={this.headerBackgroundColor}>
          <ion-buttons slot="start">
            <ion-menu-button />
          </ion-buttons>
          <ion-title>{this.facade.__("menu-selection")}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content fullscreen={true}>
        <div slot="fixed" class="station-selection-content">
          <div data-testid="numpad-input" class="numpad-input">
            {this.input}
          </div>
          <sc-numpad
            full
            onConfirm={() => this.checkStation()}
            onDelete={() => this.clearLastInput()}
            onNumber={(e) => this.addToInput(`${e.detail}`)}
          />
        </div>
      </ion-content>
    ];
  }
}

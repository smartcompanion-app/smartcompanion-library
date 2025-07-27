import { Component, State, Prop, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-selection',
  styleUrl: 'page-selection.scss'
})
export class PageSelection {

  protected maxLength = 2;

  @Prop() facade: ServiceFacade;

  @State() input: string = "";

  async componentWillLoad() {
    await this.facade
      .getMenuService()
      .enable();
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
    const stations = await this.facade.getStationService().getStations();
    const index = stations.findIndex(station => station.number == this.input);
    this.input = "";

    if (index >= 0) {
      this.openStation(`${index}`);
    }
  }  

  openStation(stationIndex: string) {
    this.facade
      .getRoutingService()
      .push(`/stations/${stationIndex}`);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>{this.facade.__("menu-selection")}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content fullscreen={true}>
        <div slot="fixed" class="station-selection-content">
          <div class="numpad-input">
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

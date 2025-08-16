import { Component, Prop, State, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';

@Component({
  tag: 'sc-page-station-list',
  styleUrl: 'page-station-list.scss'
})
export class PageStationList {

  @State() stations: Station[] = [];

  @Prop() facade: ServiceFacade;
  @Prop() tourId: string;

  async componentWillLoad() {
    await this.facade.getMenuService().enable();

    if (this.tourId) {
      if (this.tourId == "default") {
        const tour = await this.facade.getTourService().getDefaultTour();
        this.stations = await this.facade.getTourService().getStations(tour.id);
      } else {
        this.stations = await this.facade.getTourService().getStations(this.tourId);
      }
    } else {
      this.stations = await this.facade.getStationService().getStations();
    }
  }

  openStation(stationId: string) {
    this.facade.getRoutingService().push(`/tours/${this.tourId}/stations/${stationId}`);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button text="" default-href="/tours"></ion-back-button>
          </ion-buttons>
          <ion-title>{this.facade.__("station-list")}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list lines="full" class="station-list">
          {this.stations.map(station =>
            <ion-item button onClick={() => this.openStation(station.id)}>
              <ion-avatar slot="start">
                <sc-station-icon>{station.number}</sc-station-icon>
              </ion-avatar>
              <ion-label>
                <h2>{station.title}</h2>
                <p>{station.subtitle}</p>
              </ion-label>
            </ion-item>
          )}
        </ion-list>
      </ion-content>
    ];
  }
}   
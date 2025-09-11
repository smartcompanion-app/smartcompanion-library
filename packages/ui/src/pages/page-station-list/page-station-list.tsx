import { Component, Prop, State, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { getMenuButton, getStations, openStation } from '../../utils';

@Component({
  tag: 'sc-page-station-list',
  styleUrl: 'page-station-list.scss'
})
export class PageStationList {

  @State() stations: Station[] = [];

  /**
   * Background color of the header toolbard, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';

  /**
   * The ID of the tour to display stations for, or null if all stations should be displayed
   */
  @Prop() tourId: string = null;

  @Prop() facade: ServiceFacade;  

  async componentWillLoad() {
    await this.facade.getMenuService().enable();
    this.stations = await getStations(this.facade, this.tourId);
  }

  openStation(stationId: string) {
    openStation(this.facade, stationId, this.tourId);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color={this.headerBackgroundColor}>
          <ion-buttons slot="start">
            {getMenuButton(!!this.tourId, "/tours")}
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
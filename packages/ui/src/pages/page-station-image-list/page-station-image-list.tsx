import { Component, Prop, State, Host, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';
import { Station, Asset } from '@smartcompanion/data';
import { getMenuButton, getSortedStations, openStation } from '../../utils';

@Component({
  tag: 'sc-page-station-image-list',
  styleUrl: 'page-station-image-list.scss'
})
export class PageStationImageList {

  @State() stations: Station[] = [];

  /**
   * Background color of the header toolbar, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';

  /**
   * The ID of the tour to display stations for, or null if all stations should be displayed
   */
  @Prop() tourId: string = null;

  @Prop() facade: ServiceFacade;

  async componentWillLoad() {
    this.stations = await getSortedStations(this.facade, this.tourId);
    await this.facade.getMenuService().enable();
  }

  openStation(stationId: string) {
    openStation(this.facade, stationId, this.tourId);
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color={this.headerBackgroundColor}>
            <ion-buttons slot="start">
              {getMenuButton(!!this.tourId, "/tours")}
            </ion-buttons>
            <ion-title>{this.facade.__("station-list")}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="station-image-list">
          <ion-list>
            {this.stations.map(station => (
              <ion-card>
                <ion-item button lines="none">
                  <ion-avatar slot="start">
                    <sc-station-icon size="large">{station.number}</sc-station-icon>
                  </ion-avatar>
                  <ion-label>
                    <h2>{station.title}</h2>
                    <p>{station.subtitle}</p>
                  </ion-label>
                </ion-item>
                <img 
                  class="station-image-list-image" 
                  src={(station.images[0] as Asset).internalWebUrl} />
                <ion-card-content>
                  <p class="station-image-list-description">{station.description}</p>
                  <ion-button onClick={() => this.openStation(station.id)}>{this.facade.__('view')}</ion-button>
                </ion-card-content>
              </ion-card>
            ))}
          </ion-list>
        </ion-content>
      </Host>
    );
  }
}

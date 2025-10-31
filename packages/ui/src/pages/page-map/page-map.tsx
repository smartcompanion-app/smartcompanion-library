import { Component, Prop, h } from '@stencil/core';
import L from 'leaflet';
import { ServiceFacade } from '@smartcompanion/services';
import { Station } from '@smartcompanion/data';
import { getMenuButton, getStations, openStation } from '../../utils';

@Component({
  styleUrl: 'page-map.scss',
  tag: 'sc-page-map'
})
export class PageMap {

  protected map: any;

  /**
   * Background color of the header toolbar, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';
  

  /**
   * Enable Back Button instead of Menu Button
   */
  @Prop() enableBackButton: boolean = false;

  /**
   * Define default back button href, only used if enableBackButton is true
   */
  @Prop() defaultBackButtonHref: string = null;

  /**
   * If tour id is given, stations only for the tour are shown.
   * Tour id 'default' is a placeholder for the default tour id.
   */
  @Prop() tourId: string = null;

  /**
   * Map bounds for the leaflet map in top left Lat/Lng, bottom right Lat/Lng
   */
  @Prop() mapBounds: Array<number>;

  /*
   * Map tiles URL for the leaflet map, e.g., 'assets/map/{z}/{y}/{x}.jpeg'
   */
  @Prop() tileUrlTemplate: string;

  /**
   * Map tiles attribution for the leaflet map
   */
  @Prop() mapAttribution: string = '';

  @Prop() facade: ServiceFacade;

  async componentWillLoad() {
    await this.facade.getMenuService().enable();
  }

  async componentDidLoad() {
    const topLeft = L.latLng(this.mapBounds[0], this.mapBounds[1]);
    const bottomRight = L.latLng(this.mapBounds[2], this.mapBounds[3]);
    const bounds = L.latLngBounds(topLeft, bottomRight);
    const centerLag = (this.mapBounds[0] + this.mapBounds[2]) / 2.0;
    const centerLng = (this.mapBounds[1] + this.mapBounds[3]) / 2.0;

    this.map = L.map('map', {
      center: L.latLng(centerLag, centerLng),
      zoom: 17,
      zoomControl: false,
      maxBounds: bounds,
      maxBoundsViscosity: 0.5,
      maxZoom: 18,
      minZoom: 17,
    });

    this.map['attributionControl'].setPrefix('');

    L.tileLayer(this.tileUrlTemplate, {
      attribution: this.mapAttribution,
    }).addTo(this.map);

    await this.stationMarkers();
  }

  async stationMarkers() {
    const stations: Station[] = await getStations(this.facade, this.tourId);

    for (let station of stations) {
      if (station.latitude && station.longitude) {
        let icon = L.divIcon({
          className: 'station-map-icon',
          html: '<sc-station-icon>' + station.number + '</sc-station-icon>'
        });

        let markerOptions: L.MarkerOptions = {
          icon: icon
        };

        L.marker([station.latitude, station.longitude], markerOptions)
          .on('click', () => {
            openStation(this.facade, station.id, this.tourId);
          }).addTo(this.map);
      }
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color={this.headerBackgroundColor}>
          <ion-buttons slot="start">
            {getMenuButton(this.enableBackButton, this.defaultBackButtonHref)}
          </ion-buttons>
          <ion-title>{this.facade.__("menu-map")}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <div slot="fixed" id="map"></div>
      </ion-content>
    ];
  }
}

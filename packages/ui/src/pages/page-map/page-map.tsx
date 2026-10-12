import { Component, Prop, Host, getAssetPath, h } from '@stencil/core';
// maplibre-gl 6 dropped its default export, so the classes are named imports.
// They double as the types, which is why there is no separate `import type`.
import { AttributionControl, Map as MapLibreMap, Marker as MapLibreMarker, getWorkerUrl, setWorkerUrl } from 'maplibre-gl';
import { StationListFacade } from '../../contracts';
import { Station } from '@smartcompanion/data';
import { getMenuButton, getStations, openStation } from '../../utils';
import { createStationMarkerElement, getMapBounds, getMapCenter, getMapStyle } from './page-map-utils.js';

/**
 * Points maplibre at the worker shipped with this component.
 *
 * maplibre looks for its worker next to its own module, which bundling into a
 * Stencil chunk leaves without it, so every map logged "Worker failed to load".
 * An app that serves the worker itself and set the URL keeps its own.
 */
function useBundledWorker() {
  if (getWorkerUrl() !== '') {
    return;
  }
  try {
    setWorkerUrl(getAssetPath('./assets/maplibre-gl-worker.mjs'));
  } catch {
    // The custom-elements build has no asset path until the app calls
    // setAssetPath(); maplibre then falls back to its own lookup.
  }
}

@Component({
  styleUrl: 'page-map.scss',
  tag: 'sc-page-map',
  // Only in the build output: stencil.config.ts copies maplibre-gl's worker
  // in. Declared so that an app's build copies the folder from the collection.
  assetsDirs: ['assets'],
})
export class PageMap {
  protected map!: MapLibreMap;
  private markers: MapLibreMarker[] = [];
  private mapContainer!: HTMLDivElement;

  /**
   * Background color of the header toolbar, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';

  /**
   * Enable Back Button instead of Menu Button
   */
  @Prop() enableBackButton: boolean = false;

  /**
   * Where the back button goes when there is no previous page to return to,
   * e.g. after opening a deep link. Defaults to `/`. Only used if
   * enableBackButton is true
   */
  @Prop() defaultBackButtonHref: string | null = null;

  /**
   * If tour id is given, stations only for the tour are shown.
   * Tour id 'default' is a placeholder for the default tour id.
   */
  @Prop() tourId: string | null = null;

  /**
   * Map bounds for the map in top left Lat/Lng, bottom right Lat/Lng
   */
  @Prop() mapBounds!: Array<number>;

  /**
   * Map style URL for vector maps, e.g., 'https://demotiles.maplibre.org/style.json'.
   * Provide either this or tileUrlTemplate; one of the two must be set.
   */
  @Prop() mapStyleUrl: string | null = null;

  /**
   * Raster map tiles URL fallback, e.g., 'assets/map/{z}/{y}/{x}.jpeg'.
   * Provide either this or mapStyleUrl; one of the two must be set.
   */
  @Prop() tileUrlTemplate: string | null = null;

  /**
   * Map attribution for the map
   */
  @Prop() mapAttribution: string = '';

  /** The service facade instance */
  @Prop() facade!: StationListFacade;

  async componentWillLoad() {
    await this.facade.getMenuService().enable();
  }

  async componentDidLoad() {
    useBundledWorker();

    this.map = new MapLibreMap({
      attributionControl: false,
      center: getMapCenter(this.mapBounds),
      container: this.mapContainer,
      maxBounds: getMapBounds(this.mapBounds),
      maxZoom: 18,
      minZoom: 17,
      style: getMapStyle(this.mapStyleUrl, this.tileUrlTemplate, this.mapAttribution),
      zoom: 17,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });

    this.map.touchZoomRotate.disableRotation();
    this.map.addControl(new AttributionControl({ customAttribution: this.mapAttribution, compact: false }));

    await this.stationMarkers();
  }

  disconnectedCallback() {
    for (const marker of this.markers) {
      marker.remove();
    }

    this.markers = [];
    this.map?.remove();
  }

  private async stationMarkers() {
    const stations: Station[] = await getStations(this.facade, this.tourId);

    for (const station of stations) {
      if (station.latitude !== undefined && station.longitude !== undefined) {
        const markerElement = createStationMarkerElement(station.number ?? '');

        const marker = new MapLibreMarker({ anchor: 'bottom', element: markerElement });

        marker.setLngLat([station.longitude, station.latitude]);
        marker.on('click', () => {
          openStation(this.facade, station.id, this.tourId);
        });
        marker.addTo(this.map);

        this.markers.push(marker);
      }
    }
  }

  private handleBack = () => {
    this.facade.getRoutingService().back(this.defaultBackButtonHref || undefined);
  };

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color={this.headerBackgroundColor}>
            <ion-buttons slot="start">{getMenuButton(this.enableBackButton, this.handleBack)}</ion-buttons>
            <ion-title>{this.facade.__('menu-map')}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="map" slot="fixed" ref={el => (this.mapContainer = el!)}></div>
        </ion-content>
      </Host>
    );
  }
}

import type { StyleSpecification } from 'maplibre-gl';

export function getMapCenter(mapBounds: Array<number>): [number, number] {
  const south = Math.min(mapBounds[0], mapBounds[2]);
  const north = Math.max(mapBounds[0], mapBounds[2]);
  const west = Math.min(mapBounds[1], mapBounds[3]);
  const east = Math.max(mapBounds[1], mapBounds[3]);

  return [(west + east) / 2.0, (south + north) / 2.0];
}

export function getMapBounds(mapBounds: Array<number>): [[number, number], [number, number]] {
  const south = Math.min(mapBounds[0], mapBounds[2]);
  const north = Math.max(mapBounds[0], mapBounds[2]);
  const west = Math.min(mapBounds[1], mapBounds[3]);
  const east = Math.max(mapBounds[1], mapBounds[3]);

  return [
    [west, south],
    [east, north],
  ];
}

export function getMapStyle(mapStyleUrl: string | null, tileUrlTemplate: string | null, mapAttribution: string): string | StyleSpecification {
  if (mapStyleUrl !== null) {
    return mapStyleUrl;
  }

  if (tileUrlTemplate === null) {
    throw new Error('PageMap requires either mapStyleUrl or tileUrlTemplate');
  }

  return {
    layers: [
      {
        id: 'map-raster-layer',
        source: 'map-raster-source',
        type: 'raster',
      },
    ],
    sources: {
      'map-raster-source': {
        attribution: mapAttribution || undefined,
        tileSize: 256,
        tiles: [tileUrlTemplate],
        type: 'raster',
      },
    },
    version: 8,
  };
}

export function createStationMarkerElement(stationNumber: string): HTMLElement {
  const markerElement = document.createElement('div');
  markerElement.className = 'station-map-marker';
  markerElement.innerHTML = '<sc-station-icon>' + stationNumber + '</sc-station-icon>';
  return markerElement;
}

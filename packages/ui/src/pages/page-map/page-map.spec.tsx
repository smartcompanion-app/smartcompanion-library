import { beforeEach, describe, expect, it } from 'vitest';
import { createStationMarkerElement, getMapBounds, getMapCenter, getMapStyle, shouldUseCustomAttribution } from './page-map-utils.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('page-map helpers', () => {
  it('derives map center and bounds from the configured map box', () => {
    const mapBounds = [47.58308, 12.166456, 47.578141, 12.171476];

    const center = getMapCenter(mapBounds);
    expect(center[0]).toBeCloseTo(12.168966, 6);
    expect(center[1]).toBeCloseTo(47.5806105, 6);
    expect(getMapBounds(mapBounds)).toEqual([
      [12.166456, 47.578141],
      [12.171476, 47.58308],
    ]);
  });

  it('builds a vector style URL or raster fallback style as needed', () => {
    expect(getMapStyle('https://example.com/style.json', null, 'Custom attribution')).toBe('https://example.com/style.json');
    expect(shouldUseCustomAttribution('https://example.com/style.json', 'Custom attribution')).toBe(true);

    expect(getMapStyle(null, 'map-assets/{z}/{y}/{x}.jpeg', '&copy; basemap.at')).toMatchObject({
      layers: [{ id: 'map-raster-layer', source: 'map-raster-source', type: 'raster' }],
      sources: {
        'map-raster-source': {
          attribution: '&copy; basemap.at',
          tileSize: 256,
          tiles: ['map-assets/{z}/{y}/{x}.jpeg'],
          type: 'raster',
        },
      },
      version: 8,
    });

    expect(() => getMapStyle(null, null, '')).toThrow('PageMap requires either mapStyleUrl or tileUrlTemplate');
  });

  it('creates the station marker markup used on the map', () => {
    const markerElement = createStationMarkerElement('12');

    expect(markerElement.className).toBe('station-map-marker');
    expect(markerElement.innerHTML).toBe('<sc-station-icon>12</sc-station-icon>');
  });
});

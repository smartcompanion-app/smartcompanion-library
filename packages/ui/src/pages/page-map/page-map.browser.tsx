import { render, h, describe, it, expect } from '@stencil/vitest';
import { Menu, Router, StationListFacade, StationSource, TourSource } from '../../contracts';
import { Station } from '@smartcompanion/data';

// The map box the storybook example uses, around the same tiles.
const mapBounds = [47.58308, 12.166456, 47.578141, 12.171476];

const stations: Station[] = [
  { id: 'a', number: '1', latitude: 47.5805, longitude: 12.1685 } as Station,
  { id: 'b', number: '2', latitude: 47.5812, longitude: 12.1695 } as Station,
  // No coordinates: belongs to the tour, but cannot be placed on the map.
  { id: 'c', number: '3' } as Station,
];

const createFacade = (pushed: string[], tourStations: Station[] = stations) =>
  ({
    getMenuService: () =>
      ({
        enable: () => Promise.resolve(),
      }) as Menu,
    getStationService: () =>
      ({
        getStations: () => Promise.resolve(stations),
      }) as StationSource,
    getTourService: () =>
      ({
        getStations: (_tourId: string) => Promise.resolve(tourStations),
      }) as TourSource,
    getRoutingService: () =>
      ({
        push: (uri: string) => {
          pushed.push(uri);
          return Promise.resolve();
        },
      }) as Router,
    __: (key: string) => key,
  }) as StationListFacade;

const markers = (root: HTMLElement) => Array.from(root.querySelectorAll('.station-map-marker')) as HTMLElement[];

const renderMap = async (facade: StationListFacade, tourId?: string) => {
  const result = await render(
    <sc-page-map mapBounds={mapBounds} tileUrlTemplate="map-assets/{z}/{y}/{x}.jpeg" mapAttribution="&copy; basemap.at" facade={facade} tourId={tourId} />,
  );
  await result.waitForChanges();
  // Markers are attached once the station list resolves, one microtask after
  // componentDidLoad kicks off stationMarkers().
  await new Promise(resolve => setTimeout(resolve, 0));
  await result.waitForChanges();
  return result;
};

describe('sc-page-map', () => {
  it('initialises a real maplibre map', async () => {
    const { root } = await renderMap(createFacade([]));

    // A WebGL canvas is the thing mock-doc could never produce, and the reason
    // this page had no rendering test at all before.
    expect(root.querySelector('canvas.maplibregl-canvas')).not.toBeNull();
  });

  it('places one marker per station that has coordinates', async () => {
    const { root } = await renderMap(createFacade([]));

    const placed = markers(root);
    expect(placed).toHaveLength(2);
    expect(placed.map(marker => marker.textContent.trim())).toEqual(['1', '2']);
  });

  it('opens the station a marker belongs to when it is clicked', async () => {
    const pushed: string[] = [];
    const { root } = await renderMap(createFacade(pushed));

    markers(root)[1].click();

    expect(pushed).toEqual(['/stations/b']);
  });

  it('keeps the tour in the route when the map is scoped to one', async () => {
    const pushed: string[] = [];
    const { root } = await renderMap(createFacade(pushed, [stations[0]]), 'tour-7');

    const placed = markers(root);
    expect(placed).toHaveLength(1);

    placed[0].click();

    expect(pushed).toEqual(['/tours/tour-7/stations/a']);
  });
});

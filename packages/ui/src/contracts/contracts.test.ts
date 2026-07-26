import { test, expect } from 'vitest';
import { ServiceFacade } from '@smartcompanion/services';
import {
  AudioPlayerFacade,
  PageErrorFacade,
  PageLanguageFacade,
  PageLoadingFacade,
  PageMultiAudioStationFacade,
  PagePinFacade,
  PageStationFacade,
  PageTourListFacade,
  StationListFacade,
} from './index';

/**
 * Compile-time drift check: the ServiceFacade of @smartcompanion/services
 * must structurally satisfy every composed page facade type. If the facade
 * or a contract changes incompatibly, this file fails to compile.
 */
const facade = new ServiceFacade();

const _pageError: PageErrorFacade = facade;
const _pageLanguage: PageLanguageFacade = facade;
const _pageLoading: PageLoadingFacade = facade;
const _pagePin: PagePinFacade = facade;
const _pageTourList: PageTourListFacade = facade;
const _stationList: StationListFacade = facade;
const _pageStation: PageStationFacade = facade;
const _pageMultiAudioStation: PageMultiAudioStationFacade = facade;
const _audioPlayer: AudioPlayerFacade = facade;

test('ServiceFacade satisfies all page facade contracts', () => {
  expect(_pageError).toBe(facade);
  expect(_pageLanguage).toBe(facade);
  expect(_pageLoading).toBe(facade);
  expect(_pagePin).toBe(facade);
  expect(_pageTourList).toBe(facade);
  expect(_stationList).toBe(facade);
  expect(_pageStation).toBe(facade);
  expect(_pageMultiAudioStation).toBe(facade);
  expect(_audioPlayer).toBe(facade);
});

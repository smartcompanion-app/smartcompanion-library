import { test, beforeEach, expect } from '@jest/globals';
import { MemoryStorage } from "@smartcompanion/data";
import { ServiceFacade } from '../src/service-facade';

let serviceFacade: ServiceFacade;
beforeEach(() => {
  serviceFacade = new ServiceFacade(new MemoryStorage());
  serviceFacade.registerDefaultServices();
  serviceFacade.registerOnlineLoadService(async () => { return {}; });
});

test("canLoadRoute should redirect to '/' if no language is selected", () => {
  globalThis.location = { hash: '#/some-route' } as any;
  const result = serviceFacade.canLoadRoute();
  expect(result).toEqual({ redirect: "/" });
  expect(serviceFacade.getStorage().get('pending-route')).toEqual('/some-route');
});

test("canLoadRoute should return 'true' if language is selected", () => {
  serviceFacade.getStorage().set('languages', [
    { title: "English", language: "en" },
    { title: "Deutsch", language: "de" },
  ]);
  serviceFacade.changeLanguage('de');
  const result = serviceFacade.canLoadRoute();
  expect(result).toBeTruthy();
  expect(serviceFacade.getStorage().has('pending-route')).toBeFalsy();
});

test("should return pending route and clear afterwards", () => {
  serviceFacade.getStorage().set('pending-route', '/test-route');
  const route = serviceFacade.getPendingRoute();
  expect(route).toEqual('/test-route');
  expect(serviceFacade.getStorage().has('pending-route')).toBeFalsy();
});

test("should return null for pending route if none exists", () => {
  const route = serviceFacade.getPendingRoute();
  expect(route).toBeNull();
});

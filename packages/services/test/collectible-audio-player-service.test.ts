import { test, beforeEach, expect } from '@jest/globals';
import { CollectibleAudioPlayerService } from '../src/services/audio-player-service/collectible-audio-player-service';

let service: CollectibleAudioPlayerService;
beforeEach(() => {
  service = new CollectibleAudioPlayerService("");
});

test('calculate collected time by array of positions', () => {
  expect(service.calcuateCollectedTime([12, 14, 17])).toEqual(5);
  expect(service.calcuateCollectedTime([14, 17])).toEqual(3);
  expect(service.calcuateCollectedTime([17])).toEqual(0);
});

test('calculate collected percentage by collected time and duration', () => {
  expect(service.calculateCollectedPercentage(5, 100)).toEqual(.05);
  expect(service.calculateCollectedPercentage(110, 100)).toEqual(1);
  expect(service.calculateCollectedPercentage(10, 0)).toEqual(0);
  expect(service.calculateCollectedPercentage(0, 0)).toEqual(0);
});

import { expect, test, describe, beforeEach } from 'vitest';
import { MemoryStorage } from '../../../src/storage';
import { ShareService } from '../../../src/domain';

describe('test share service', () => {

  let share = "https://example.com";
  let memoryStorage = new MemoryStorage();
  let service = new ShareService(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    memoryStorage.set('share', share);
    service = new ShareService(memoryStorage);
  });

  test('should return the share url', () => {
    expect(service.getShare()).toEqual(share);
  });

  test('should return true if share is in storage', () => {
    expect(service.hasShare()).toBeTruthy();
  });

  test('should return false if share is not in storage', () => {
    const emptyStorage = new MemoryStorage();
    const emptyService = new ShareService(emptyStorage);
    expect(emptyService.hasShare()).toBeFalsy();
  });

  test('should throw if share is not defined', () => {
    const emptyStorage = new MemoryStorage();
    const emptyService = new ShareService(emptyStorage);
    expect(() => emptyService.getShare()).toThrow();
  });
});

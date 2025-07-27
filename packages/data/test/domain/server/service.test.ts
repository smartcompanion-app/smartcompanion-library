import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { ServerService } from '../../../src/domain';

describe('test text service', () => {

  let servers = ["abc", "xyz"];
  let memoryStorage = new MemoryStorage();
  let service = new ServerService(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    memoryStorage.set('servers', servers);
    service = new ServerService(memoryStorage);
  });

  test('should return a random server', () => {
    for (let i = 0; i < 30; i++) {
      let server = service.getRandomServer();
      expect(servers.indexOf(server)).toBeGreaterThanOrEqual(0);
    }
  });

  test('should return true if servers are in storage', () => {
    expect(service.hasServers()).toBeTruthy();
  });
});

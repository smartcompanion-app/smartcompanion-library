import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { ServerRepository } from '../../../src/data';

describe('test text repository', () => {

    let servers = ["abc", "xyz"];
    let memoryStorage = new MemoryStorage();
    let repository = new ServerRepository(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        memoryStorage.set('servers', servers);
        repository = new ServerRepository(memoryStorage);
    });
  
    test('should return a random server', () => {
        for (let i = 0; i < 30; i++) {
            let server = repository.getRandomServer();            
            expect(servers.indexOf(server)).toBeGreaterThanOrEqual(0);
        }       
    });

    test('should return true if servers are in storage', () => {
        expect(repository.hasServers()).toBeTruthy();
    });

});
import { Storage } from '../../storage';

export class ServerService {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  hasServers(): boolean {
    return this.storage.has('servers');
  }

  getRandomServer(): string {
    if (this.hasServers()) {
      const servers = this.storage.get('servers') as string[];
      return servers[Math.floor(Math.random() * servers.length)];
    }
    throw new Error('There are no servers defined');
  }
}

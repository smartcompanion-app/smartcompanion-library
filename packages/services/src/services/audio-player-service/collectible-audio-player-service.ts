import { Station } from "@smartcompanion/data";
import { AudioPlayerService, AudioPlayerServiceItem } from "./audio-player-service";
import { AudioPlayerUpdate } from "./audio-player-update";

export class CollectibleAudioPlayerService extends AudioPlayerService {

  protected positions: number[] = [];
  protected id: string = "";
  protected state = 'init';
  protected registeredCallback: (update: AudioPlayerUpdate) => void = null;

  constructor(
    subtitle: string,
    protected collection: any = {}
  ) {
    super(subtitle);
  }

  async updatePosition(position: number) {
    if (this.state == 'playing') {
      this.positions.push(position);
    }
    if (this.positions.length >= 2 && this.id != "" && this.id in this.collection) {
      const duration = this.collection[this.id].duration;
      const collectedTime = this.calcuateCollectedTime(this.positions);
      const collectedPercentage = this.calculateCollectedPercentage(collectedTime, duration);
      this.collection[this.id].collectedTime += collectedTime;
      this.collection[this.id].collectedPercentage += collectedPercentage;
      this.positions = [this.positions.pop()]; // leave last position as new reference point

      // publish "collected" state/event
      await this?.registeredCallback({
        state: "collected",
        id: this.id,
        index: this.getIndex(this.id),
        percentage: this.collection[this.id].collectedPercentage
      });
    }
  }

  calcuateCollectedTime(positionsArray: number[]): number {
    let collectedTime = 0;
    for (let i = 0; i < positionsArray.length - 1; i++) {
      collectedTime += positionsArray[i + 1] - positionsArray[i];
    }
    return collectedTime;
  }

  calculateCollectedPercentage(collectedTime: number, duration: number): number {
    if (collectedTime > 0 && duration > 0) {
      const collectedPercentage = collectedTime / duration;
      return collectedPercentage > 1 ? 1 : collectedPercentage;
    }
    return 0;
  }

  async initCollection(id: string) {
    if (!(this.collection[id].duration > 0)) {
      this.collection[id].duration = await this.getDuration();

      // check if collectedPercentage was set from storage, but collectedTime is empty (which is not stored)
      if (this.collection[id].collectedPercentage > 0 && this.collection[id].collectedTime == 0) {
        this.collection[id].collectedTime = this.collection[id].duration * this.collection[id].collectedPercentage;
      }
    }
  }

  async registerUpdateListener(callback: (update: AudioPlayerUpdate) => void) {
    this.registeredCallback = callback;
    super.registerUpdateListener(async (update: AudioPlayerUpdate) => {

      // pass-through default events from AudioPlayerService
      await callback(update);
      this.initCollection(update.id);

      if (update.state == 'playing') {
        this.state = 'playing';
        this.id = update.id;
      } else if (update.state == 'paused' && this.id == update.id) {
        this.state = 'paused';
        this.positions = [];
      } else if (update.state == 'skip') {
        this.state = 'init';
        this.positions = [];
        this.id = update.id; // next id
      }
    });
  }

  async unregisterUpdateListener() {
    this.registeredCallback = null;
    super.unregisterUpdateListener();
  }

  async getPosition(): Promise<number> {
    const position = await super.getPosition();
    this.updatePosition(position); // update position value continously
    return position;
  }

  getPlayerItems(stations: Station[]): AudioPlayerServiceItem[] {
    const playerItems = super.getPlayerItems(stations) as AudioPlayerServiceItem[];

    playerItems.forEach(item => this.collection[item.id] = {
      collectedTime: 0,
      collectedPercentage: item.collectedPercentage,
      duration: 0
    });
    return playerItems;
  }
}

import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { AudioPlayerUpdate, AudioPlayerService, ServiceFacade } from '@smartcompanion/services';
import { PageStations } from './page-stations';
import { StationService } from '@smartcompanion/data';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Stations',
  tags: ['autodocs'],
  component: PageStations,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-stations stationIndex={0} facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

const stations = [
  { 
    id: '1', 
    number: '1', 
    title: 'Station 1', 
    subtitle: 'Crocodile', 
    collectedPercentage: 0.25,
    images: [
      { id: 'crocodile', filename: 'crocodile.jpg', internalWebUrl: 'station-assets/crocodile.jpg' },
      { id: 'crocodile', filename: 'crocodile.jpg', internalWebUrl: 'station-assets/crocodile.jpg' }
    ]
  },
  { 
    id: '2', 
    number: '2', 
    title: 'Station 2', 
    subtitle: 'Elephant', 
    collectedPercentage: 0.55,
    images: [
      { id: 'elephant', filename: 'elephant.jpg', internalWebUrl: 'station-assets/elephant.jpg' },
      { id: 'elephant', filename: 'elephant.jpg', internalWebUrl: 'station-assets/elephant.jpg' }
    ]
  },
  { 
    id: '3', 
    number: '3', 
    title: 'Station 3', 
    subtitle: 'Leopard', 
    collectedPercentage: 0.35,
    images: [
      { id: 'leopard', filename: 'leopard.jpg', internalWebUrl: 'station-assets/leopard.jpg' },
      { id: 'leopard', filename: 'leopard.jpg', internalWebUrl: 'station-assets/leopard.jpg' }
    ]
  },
];

class MockAudioPlayer {
  private intervalId;
  private internalIndex = 0;
  private position = 0;
  private internalListener: (update: AudioPlayerUpdate) => Promise<void>;

  start(_) { return Promise.resolve() }
  
  registerUpdateListener(listener) {
    console.log("Internal listener registered", listener);
    this.internalListener = listener;
    return Promise.resolve();
  }
  unregisterUpdateListener() {
    this.internalListener = undefined;
    return Promise.resolve();
  }
  select(index: number) {
    this.clearInterval();
    this.position = 0;
    this.internalIndex = index;
    this.internalListener({ state: 'skip', index, id: (index + 1) + "" });
    return Promise.resolve();
  }
  play() {            
    this.internalListener({ state: 'playing', index: this.internalIndex, id: (this.internalIndex + 1) + "" });
    this.intervalId = setInterval(() => {
      this.position += 4;
      this.internalListener({ state: 'collected', index: this.internalIndex, id: (this.internalIndex + 1) + "", percentage: this.position / 300 });
      if (this.position >= 300) {
        this.clearInterval();
        this.internalListener({ state: 'completed', index: this.internalIndex, id: (this.internalIndex + 1) + "" });
      }
    }, 800);
    return Promise.resolve();
  }
  pause() {
    this.clearInterval();
    this.internalListener({ state: 'paused', index: this.internalIndex, id: (this.internalIndex + 1) + "" });

    return Promise.resolve();
  }
  stop() {
    this.clearInterval();
    this.position = 0;
    this.internalListener({ state: 'stopped', index: this.internalIndex, id: (this.internalIndex + 1) + "" });
    this.position = 0;
    return Promise.resolve();
  }
  next() {
    this.clearInterval();
    this.position = 0;
    const nextIndex = this.internalIndex >= 2 ? 0 : this.internalIndex + 1;
    this.internalListener({ state: 'skip', index: nextIndex, id: (nextIndex + 1) + "" });
    this.internalIndex = nextIndex;
    this.position = 0;
    return Promise.resolve();
  }
  prev() {
    this.clearInterval();
    this.position = 0;
    const prevIndex = this.internalIndex < 1 ? 2 : (this.internalIndex - 1);
    this.internalListener({ state: 'skip', index: prevIndex, id: (prevIndex + 1) + "" });
    this.internalIndex = prevIndex;
    this.position = 0;
    return Promise.resolve();
  }
  seek(position: number) {
    this.position = position;
    this.internalListener({ state: 'seek', index: this.internalIndex, id: (this.internalIndex + 1) + "" });
    return Promise.resolve();
  }
  getDuration() {
    return Promise.resolve(300);
  }
  getPosition() {
    return Promise.resolve(this.position);
  }
  getIndex() {
    return this.internalIndex;
  }
  getId() {
    return (this.internalIndex + 1) + "";
  }
  setEarpiece() {
    return Promise.resolve();
  }
  setSpeaker() {
    return Promise.resolve();
  }
  getPlayerItems() {
    return [];
  }
  getPlayerImage() {
    return Promise.resolve([]);
  }
  clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

const mockAudioPlayer: Partial<AudioPlayerService> = new MockAudioPlayer();

export const Example: Story = {
  args: {
    facade: {      
      getAudioPlayerService: () => mockAudioPlayer as AudioPlayerService,
      getStationService: () => ({
        updateCollectedPercentage: (stationId: string, _: string, collectedPercentage: number) => {
          return Promise.resolve({
            ...stations.find(station => station.id === stationId),
            collectedPercentage: collectedPercentage,
          });
        },
        getStations: () => {
          return Promise.resolve(stations);
        },
      }) as StationService,      
    },
  },
};


import { Station } from "@smartcompanion/data";
import { AudioPlayerUpdate, ServiceFacade } from "@smartcompanion/services";

interface AudioPlayerPage {
  facade: ServiceFacade;
  earpiece: boolean;
  playing: boolean;
  position: number;
  duration: number;
  activeIndex: number;
}

export class ReactiveAudioPlayer {

  private facade: ServiceFacade;
  private earpiece: boolean = false;
  private playing: boolean = false
  private position: number = 0;
  private duration: number = 0;
  private activeIndex: number = 0;

  private earpieceListener: ((earpiece: boolean) => void) | null = null;
  private playingListener: ((playing: boolean) => void) | null = null;
  private positionListener: ((position: number) => void) | null = null;
  private durationListener: ((duration: number) => void) | null = null;
  private activeIndexListener: ((activeIndex: number) => void) | null = null;
  private completedListener: ((update: AudioPlayerUpdate) => Promise<void>) | null = async () => {
    await this.facade.getAudioPlayerService().pause();
    await this.facade.getAudioPlayerService().seek(0);
    this.updatePosition(0);
  }
  private collectedListener: ((update: AudioPlayerUpdate, station: Station) => Promise<void>) | null = null;
  private skipListener: ((update: AudioPlayerUpdate) => Promise<void>) | null = null;

  constructor(page: AudioPlayerPage) {
    this.facade = page.facade;
    this.earpiece = page.earpiece;
    this.playing = page.playing;
    this.position = page.position;
    this.duration = page.duration;
    this.activeIndex = page.activeIndex;
    this.setDefaultUpdateListeners(page);
    this.initEarpiece();
  }

  setDefaultUpdateListeners(page: {
    earpiece: boolean,
    playing: boolean,
    position: number,
    duration: number,
    activeIndex: number
  }) {
    this.setOnEarpieceUpdateListener((earpiece: boolean) => {
      page.earpiece = earpiece;
    });
    this.setOnPlayingUpdateListener((playing: boolean) => {
      page.playing = playing;
    });
    this.setOnPositionUpdateListener((position: number) => {
      page.position = position;
    });
    this.setOnDurationUpdateListener((duration: number) => {
      page.duration = duration;
    });
    this.setOnActiveIndexUpdateListener((activeIndex: number) => {
      page.activeIndex = activeIndex;
    });
  }

  setOnEarpieceUpdateListener(listener: (earpiece: boolean) => void) {
    this.earpieceListener = listener;
  }
  setOnPlayingUpdateListener(listener: (playing: boolean) => void) {
    this.playingListener = listener;
  }
  setOnPositionUpdateListener(listener: (position: number) => void) {
    this.positionListener = listener;
  }
  setOnDurationUpdateListener(listener: (duration: number) => void) {
    this.durationListener = listener;
  }
  setOnActiveIndexUpdateListener(listener: (activeIndex: number) => void) {
    this.activeIndexListener = listener;
  }
  setOnCompletedListener(listener: (update: AudioPlayerUpdate) => Promise<void>) {
    this.completedListener = listener;
  }
  setOnCollectedListener(listener: (update: AudioPlayerUpdate, station: Station) => Promise<void>) {
    this.collectedListener = listener;
  }
  setOnSkipListener(listener: (update: AudioPlayerUpdate) => Promise<void>) {
    this.skipListener = listener;
  }

  removeAllListeners() {
    this.earpieceListener = null;
    this.playingListener = null;
    this.positionListener = null;
    this.durationListener = null;
    this.activeIndexListener = null;
    this.completedListener = null;
    this.collectedListener = null;
    this.skipListener = null;
  }

  updateEarpiece(earpiece: boolean) {
    this.earpiece = earpiece;
    if (this.earpieceListener !== null) {
      this.earpieceListener(earpiece);
    }
  }

  updatePlaying(playing: boolean) {
    this.playing = playing;
    if (this.playingListener !== null) {
      this.playingListener(playing);
    }
  }

  updatePosition(position: number) {
    this.position = position;
    if (this.positionListener !== null) {
      this.positionListener(position);
    }
  }

  updateDuration(duration: number) {
    this.duration = duration;
    if (this.durationListener !== null) {
      this.durationListener(duration);
    }
  }

  updateActiveIndex(activeIndex: number) {
    this.activeIndex = activeIndex;
    if (this.activeIndexListener !== null) {
      this.activeIndexListener(activeIndex);
    }
  }

  /**
   * Read earpiece state from storage or default to false
   */
  readEarpiece(): boolean {
    return window.localStorage.getItem('audio-earpiece') == 'yes' ? true : false;
  }
  
  /**
   * Initialize earpiece/speaker state from local storage
   * Should be called in componentWillLoad() lifecycle method
   */
  async initEarpiece() {
    this.updateEarpiece(this.readEarpiece());
  }

  /**
   * Initialize eaudio player with given stations
   * Should be called in componentDidLoad() lifecycle method
   */
  async initAudioPlayer(stations: Array<Station>) {
    await this.facade.getAudioPlayerService().start(stations);

    if (this.earpiece) {
      await this.facade.getAudioPlayerService().setEarpiece();
    } else {
      await this.facade.getAudioPlayerService().setSpeaker();
    }

    this.facade.getAudioPlayerService().registerUpdateListener(async (update: AudioPlayerUpdate) => {
      if (update.state == 'playing') {
        this.updatePlaying(true);
        this.triggerPositionUpdate();
      } else if (update.state == 'paused') {
        this.updatePlaying(false);
      } else if (update.state == 'skip') {
        this.updateActiveIndex(update.index);
        await this.onSkip(update);
        await this.resetAudioPlayer();
      } else if (update.state == "completed") {
        await this.onCompleted(update);
      } else if (update.state == "collected") {
        const stationId = this.facade.getAudioPlayerService().getStationId(update.index);

        const station = await this
          .facade
          .getStationService()
          .updateCollectedPercentage(
            stationId,
            update.id,
            update.percentage
          );

        await this.onCollected(update, station);
      }
    });

    await this.facade.getAudioPlayerService().select(this.activeIndex);
    await this.resetAudioPlayer();
  }

  /**
   * Destroy audio player and unregister update listener
   * Should be called in disconnectedCallback() lifecycle method
   */
  async destroyAudioPlayer() {
    this.updatePlaying(false);
    await this.facade.getAudioPlayerService().stop();
    this.facade.getAudioPlayerService().unregisterUpdateListener();
    this.removeAllListeners();
  }

  async resetAudioPlayer() {
    this.updatePlaying(false);
    this.updatePosition(0);
    this.updateDuration(await this.facade.getAudioPlayerService().getDuration());
  }

  async select(audioIndex: number) {
    await this.facade.getAudioPlayerService().select(audioIndex);
  }

  async next() {
    await this.facade.getAudioPlayerService().next();
  }

  async prev() {
    await this.facade.getAudioPlayerService().prev();
  }

  async play() {
    await this.facade.getAudioPlayerService().play();
  }

  async pause() {
    await this.facade.getAudioPlayerService().pause();
  }

  async playPause() {
    if (this.playing) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async startPositionChange() {
    await this.facade.getAudioPlayerService().pause();
  }

  async changePosition(position: number) {
    this.updatePosition(position);
    await this.facade.getAudioPlayerService().seek(position);
    await this.facade.getAudioPlayerService().play();
  }

  /**
   * Update activeIndex based on given station id, this works even if audioplayer is not yet initialized
   */
  updateActiveIndexByStationId(id: string, stations: Array<Station>) {
    const items = this.facade.getAudioPlayerService().getPlayerItems(stations);
    this.updateActiveIndex(this.facade.getAudioPlayerService().getIndexByStationId(id, items));
  }

  async toggleOutput() {
    if (this.earpiece) {
      await this.facade.getAudioPlayerService().setSpeaker();
    } else {
      await this.facade.getAudioPlayerService().setEarpiece();
    }
    this.updateEarpiece(!this.earpiece);
    window.localStorage.setItem('audio-earpiece', this.earpiece ? 'yes' : 'no');
  }

  async onSkip(update: AudioPlayerUpdate) {
    if (this.skipListener !== null) {
      await this.skipListener(update);
    }
  }
  
  async onCompleted(update: AudioPlayerUpdate) {
    if (this.completedListener !== null) {
      await this.completedListener(update);
    }
  }

  async onCollected(update: AudioPlayerUpdate, station: Station) {
    if (this.collectedListener !== null) {
      await this.collectedListener(update, station);
    }
  }

  async triggerPositionUpdate() {
    this.updatePosition(await this.facade.getAudioPlayerService().getPosition());
    this.updateDuration(await this.facade.getAudioPlayerService().getDuration());

    if (this.duration > 0 && this.position < this.duration) {
      setTimeout(() => {
        if (this.playing) {
          this.triggerPositionUpdate();
        }
      }, 800);
    }
  }
}

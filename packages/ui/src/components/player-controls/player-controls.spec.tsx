import { render, h, describe, it, expect } from '@stencil/vitest';

describe('sc-player-controls', () => {
  describe('prev event', () => {
    it('should emit prev event when prev button is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-player-controls></sc-player-controls>);
      const prevSpy = spyOnEvent('prev');

      const button = root.shadowRoot.querySelector('[data-testid="player-prev-button"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(prevSpy).toHaveReceivedEventTimes(1);
    });
  });

  describe('next event', () => {
    it('should emit next event when next button is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-player-controls></sc-player-controls>);
      const nextSpy = spyOnEvent('next');

      const button = root.shadowRoot.querySelector('[data-testid="player-next-button"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(nextSpy).toHaveReceivedEventTimes(1);
    });
  });

  describe('playPause event', () => {
    it('should emit playPause with false when paused and play button is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-player-controls playing={false}></sc-player-controls>);
      const playPauseSpy = spyOnEvent('playPause');

      const button = root.shadowRoot.querySelector('[data-testid="player-play-button"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(playPauseSpy).toHaveReceivedEventTimes(1);
      expect(playPauseSpy).toHaveReceivedEventDetail(false);
    });

    it('should emit playPause with true when playing and pause button is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-player-controls playing={true}></sc-player-controls>);
      const playPauseSpy = spyOnEvent('playPause');

      const button = root.shadowRoot.querySelector('[data-testid="player-play-button"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(playPauseSpy).toHaveReceivedEventTimes(1);
      expect(playPauseSpy).toHaveReceivedEventDetail(true);
    });
  });

  describe('play/pause icon', () => {
    it('should show play icon when not playing', async () => {
      const { root } = await render(<sc-player-controls playing={false}></sc-player-controls>);

      const icon = root.shadowRoot.querySelector('[data-testid="player-play-button"] ion-icon');
      expect(icon.getAttribute('name')).toBe('play');
    });

    it('should show pause icon when playing', async () => {
      const { root } = await render(<sc-player-controls playing={true}></sc-player-controls>);

      const icon = root.shadowRoot.querySelector('[data-testid="player-play-button"] ion-icon');
      expect(icon.getAttribute('name')).toBe('pause');
    });
  });

  describe('disabled state', () => {
    it('should disable play button when disabled is true', async () => {
      const { root } = await render(<sc-player-controls disabled={true}></sc-player-controls>);

      const button = root.shadowRoot.querySelector('[data-testid="player-play-button"]');
      expect(button.getAttribute('disabled')).not.toBeNull();
    });
  });

  describe('position display', () => {
    it('should display formatted position and duration', async () => {
      const { root } = await render(<sc-player-controls position={65} duration={180}></sc-player-controls>);

      const positionText = root.shadowRoot.querySelector('[data-testid="player-position"]');
      const durationText = root.shadowRoot.querySelector('[data-testid="player-duration"]');

      expect(positionText.textContent).toBe('01:05');
      expect(durationText.textContent).toBe('03:00');
    });
  });
});

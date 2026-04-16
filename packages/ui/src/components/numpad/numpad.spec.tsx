import { render, h, describe, it, expect } from '@stencil/vitest';

describe('sc-numpad', () => {
  describe('number events', () => {
    it('should emit number event with value 3 when button 3 is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-numpad></sc-numpad>);
      const numberSpy = spyOnEvent('number');

      const button = root.shadowRoot.querySelector('[data-testid="numpad-button-3"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(numberSpy).toHaveReceivedEventTimes(1);
      expect(numberSpy).toHaveReceivedEventDetail(3);
    });

    it('should emit number event with value 0 when button 0 is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-numpad></sc-numpad>);
      const numberSpy = spyOnEvent('number');

      const button = root.shadowRoot.querySelector('[data-testid="numpad-button-0"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(numberSpy).toHaveReceivedEventTimes(1);
      expect(numberSpy).toHaveReceivedEventDetail(0);
    });
  });

  describe('delete event', () => {
    it('should emit delete event when delete button is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-numpad></sc-numpad>);
      const deleteSpy = spyOnEvent('delete');

      const button = root.shadowRoot.querySelector('[data-testid="numpad-button-delete"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(deleteSpy).toHaveReceivedEventTimes(1);
    });
  });

  describe('confirm event', () => {
    it('should emit confirm event when confirm button is clicked', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(<sc-numpad full={true}></sc-numpad>);
      const confirmSpy = spyOnEvent('confirm');

      const button = root.shadowRoot.querySelector('[data-testid="numpad-button-confirm"]') as HTMLElement;
      button.click();
      await waitForChanges();

      expect(confirmSpy).toHaveReceivedEventTimes(1);
    });

    it('should not render confirm button when full is false', async () => {
      const { root } = await render(<sc-numpad></sc-numpad>);

      const button = root.shadowRoot.querySelector('[data-testid="numpad-button-confirm"]');
      expect(button).toBeNull();
    });
  });
});

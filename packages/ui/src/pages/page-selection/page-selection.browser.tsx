import { render, h, describe, it, expect } from '@stencil/vitest';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { StationService } from '@smartcompanion/data';

const facade = {
  getMenuService: () => ({
    enable: () => Promise.resolve(),
  }) as MenuService,
  getStationService: () => ({
    getStations: () => Promise.resolve([]),
  }) as StationService,
  __: (key: string) => {
    switch (key) {
      case 'menu-selection':
        return 'Station Selection';
      default:
        return key;
    }
  },
} as ServiceFacade;

const getNumpadButton = (root: HTMLElement, testId: string) => {
  return root.querySelector('sc-numpad').shadowRoot.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
};

const getInput = (root: HTMLElement) => {
  return root.querySelector('[data-testid="numpad-input"]');
};

describe('sc-page-selection', () => {
  it('should type 4 and 2, showing each entry in the input', async () => {
    const { root, waitForChanges } = await render(<sc-page-selection facade={facade}></sc-page-selection>);
    await waitForChanges();

    getNumpadButton(root, 'numpad-button-4').click();
    await waitForChanges();
    expect(getInput(root).textContent).toBe('4');

    getNumpadButton(root, 'numpad-button-2').click();
    await waitForChanges();
    expect(getInput(root).textContent).toBe('42');
  });

  it('should replace last digit when typing on a filled 2-digit numpad', async () => {
    const { root, waitForChanges } = await render(<sc-page-selection facade={facade}></sc-page-selection>);
    await waitForChanges();

    getNumpadButton(root, 'numpad-button-4').click();
    await waitForChanges();
    getNumpadButton(root, 'numpad-button-2').click();
    await waitForChanges();
    getNumpadButton(root, 'numpad-button-3').click();
    await waitForChanges();

    expect(getInput(root).textContent).toBe('43');
  });

  it('should delete numpad input one digit at a time', async () => {
    const { root, waitForChanges } = await render(<sc-page-selection facade={facade}></sc-page-selection>);
    await waitForChanges();

    getNumpadButton(root, 'numpad-button-4').click();
    await waitForChanges();
    getNumpadButton(root, 'numpad-button-2').click();
    await waitForChanges();

    getNumpadButton(root, 'numpad-button-delete').click();
    await waitForChanges();
    expect(getInput(root).textContent).toBe('4');

    getNumpadButton(root, 'numpad-button-delete').click();
    await waitForChanges();
    expect(getInput(root).textContent).toBe('');
  });

  it('should clear input when confirming', async () => {
    const { root, waitForChanges } = await render(<sc-page-selection facade={facade}></sc-page-selection>);
    await waitForChanges();

    getNumpadButton(root, 'numpad-button-4').click();
    await waitForChanges();
    getNumpadButton(root, 'numpad-button-2').click();
    await waitForChanges();
    expect(getInput(root).textContent).toBe('42');

    getNumpadButton(root, 'numpad-button-confirm').click();
    await waitForChanges();
    expect(getInput(root).textContent).toBe('');
  });
});

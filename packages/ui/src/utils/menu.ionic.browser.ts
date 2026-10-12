import { describe, it, expect, beforeEach } from 'vitest';
import { MenuService } from '@smartcompanion/services';

// MenuService against a real Ionic 9 ion-menu, at the phone width the test
// iframe has, where the menu is an overlay that has to be closed.
//
// This does not reproduce the bug MenuService was rewritten for: in an app
// built by Stencil, Ionic's menuController resolved to a second instance that
// no menu registered with (see menu-service.ts). Vite resolves every Ionic
// import here to one build, so the old implementation would pass too; the
// audioguide-app e2e specs are what caught it.

// Structural, as importing Ionic's own types would bundle Ionic into this
// library (see CLAUDE.md)
type IonMenu = HTMLElement & { disabled: boolean; isOpen(): Promise<boolean>; componentOnReady(): Promise<unknown> };

const menu = () => document.querySelector('ion-menu') as IonMenu;

beforeEach(async () => {
  document.body.innerHTML = `
    <ion-app>
      <ion-menu content-id="main"><ion-content>menu</ion-content></ion-menu>
      <div class="ion-page" id="main"></div>
    </ion-app>`;
  await customElements.whenDefined('ion-menu');
  await menu().componentOnReady();
});

describe('MenuService', () => {
  it('opens and closes the menu', async () => {
    const service = new MenuService();

    await service.open();
    expect(await menu().isOpen()).toBe(true);

    await service.close();
    expect(await menu().isOpen()).toBe(false);
  });

  it('keeps a disabled menu closed until it is enabled again', async () => {
    const service = new MenuService();

    await service.disable();
    expect(menu().disabled).toBe(true);
    await service.open();
    expect(await menu().isOpen()).toBe(false);

    await service.enable();
    await service.open();
    expect(await menu().isOpen()).toBe(true);
  });

  it('closes an open menu when disabling it', async () => {
    const service = new MenuService();

    await service.open();
    await service.disable();
    expect(await menu().isOpen()).toBe(false);
  });
});

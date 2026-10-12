// Type-only: brings in the global typings of Ionic's elements (`ion-menu`,
// `ion-router`) and nothing at runtime -- see the comment on MenuService.
import type {} from '@ionic/core';

/**
 * Drives the app's `ion-menu` through the element, not through Ionic's
 * `menuController`.
 *
 * A Stencil app compiles Ionic's components from `@ionic/core/dist/collection`,
 * and on Ionic 8 a bare `import { menuController } from '@ionic/core'` resolved
 * there too. Ionic 9 added an `exports` map, which sends that import to its
 * standalone build instead: a second `menuController` that no menu ever
 * registers with, so `close()` found no menu and the menu stayed open after
 * navigating. The element's own methods always belong to the menu on screen.
 */
export class MenuService {
  async open() {
    const menu = this.getMenu();
    if (menu && !menu.disabled) {
      await menu.open();
    }
  }

  async close() {
    const menu = this.getMenu();
    if (menu && !menu.disabled) {
      await menu.close();
    }
  }

  async disable() {
    await this.close();
    const menu = this.getMenu();
    if (menu) {
      menu.disabled = true;
    }
  }

  async enable() {
    const menu = this.getMenu();
    if (menu) {
      menu.disabled = false;
    }
  }

  private getMenu() {
    return document.querySelector('ion-menu');
  }
}

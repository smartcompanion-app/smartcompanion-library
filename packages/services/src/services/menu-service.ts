import { menuController } from '@ionic/core';

export class MenuService {

  async open() {
    if (await menuController.isEnabled()) {
      await menuController.open();
    }
  }

  async close() {
    if (await menuController.isEnabled()) {
      await menuController.close();
    }
  }

  async disable() {
    await this.close();
    await menuController.enable(false);
  }

  async enable() {
    await menuController.enable(true);
  }
}

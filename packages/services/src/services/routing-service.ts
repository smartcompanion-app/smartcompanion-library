export class RoutingService {

  async push(uri: string) {
    const ionRouter = document.querySelector('ion-router');
    await ionRouter.push(uri);
  }

  async pop() {
    const nav = document.querySelector('ion-nav');
    const count = nav.childElementCount;

    if (count > 1) {
      try {
        await nav.pop({ skipIfBusy: true });
      } catch (e) { }
    }
  }

  async pushReplaceCurrent(uri: string) {
    const ionNav = document.querySelector('ion-nav');
    const replace = await ionNav.getActive();
    await this.push(uri);

    if (replace) {
      const replaceComponent = replace.component;
      const count = ionNav.childElementCount - 1;

      for (let i = 0; i < count; i++) {
        const component = await ionNav.getByIndex(i);

        if (component) {
          const componentComponent = component.component;
          if (componentComponent == replaceComponent) {
            ionNav.removeIndex(i);
            break;
          }
        }
      }
    }
  }

  async pushReplace(uri: string) {
    const ionNav = document.querySelector('ion-nav');
    await this.push(uri);
    const count = ionNav.childElementCount;
    await ionNav.removeIndex(0, count - 1);
  }

  /**
   * 
   * Trigger callback when route change matches "to"
   * 
   * to can be a string or a string ending with "*", when eding with "*" it will match the beginning of the route
   * 
   * @param to 
   * @param callback 
   */
  addRouteChangeListener(to: string, callback: () => void) {
    const ionRouter = document.querySelector('ion-router');
    ionRouter.addEventListener('ionRouteDidChange', (e: CustomEvent) => {
      const match = to.match(/(.+)\*$/);

      if (match && e.detail.to.indexOf(match[1]) === 0) { // match the beginning of the route
        callback();
      } else if (e.detail.to === to) { // exact match
        callback();
      }
    });
  }
}

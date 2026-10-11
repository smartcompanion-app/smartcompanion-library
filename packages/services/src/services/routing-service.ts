/**
 * Navigation on top of `ion-router` and `ion-router-outlet`.
 *
 * Ionic 9 removed the integration between `ion-router` and `ion-nav`, so the
 * app's page stack now is the browser history: the outlet only ever holds the
 * current page, and going back is `history.back()`, which `ion-router` turns
 * into a back transition.
 */
export class RoutingService {
  /**
   * How many entries the app has pushed onto the history and can still go back
   * through. Going back from the first page would leave the app (or, in a
   * browser, the site), so the back button needs to tell the two apart, and
   * the history API does not expose it.
   */
  private depth = 0;

  /** `history.state` after the last navigation, see onPopState() */
  private lastState: unknown = null;

  /**
   * `history.state` of the entries left by going back: the only ones a
   * forward navigation (the browser's forward button) can return to.
   */
  private forwardStates: unknown[] = [];

  private listening = false;

  /**
   * Navigate to `uri` on a new history entry, with a forward transition.
   */
  async push(uri: string) {
    this.listen();
    // Not the return value: ion-router writes the entry before rendering and
    // reports `false` when the page was already shown, and writes none at all
    // when a guard cancels.
    const before = history.state;
    await this.getRouter().push(uri, 'forward');
    if (history.state !== before) {
      this.depth++;
      // a new entry discards everything ahead of it
      this.forwardStates = [];
    }
    this.lastState = history.state;
  }

  /**
   * Navigate to `uri` in place of the current history entry, without a
   * transition. For pages that must not be returned to: the loading page,
   * language selection, pin entry and error page.
   */
  async replace(uri: string) {
    this.listen();
    await this.getRouter().push(uri, 'root');
    this.lastState = history.state;
  }

  /**
   * Whether back() goes to a previous page of the app rather than to the
   * fallback.
   */
  canGoBack(): boolean {
    return this.depth > 0;
  }

  /**
   * Go back to the previous page with a back transition. When there is none,
   * e.g. after opening a deep link, navigate to `fallbackUri` instead.
   */
  async back(fallbackUri: string = '/') {
    this.listen();
    if (this.canGoBack()) {
      // depth is updated by onPopState, which also sees the Android back
      // button and the browser's own back navigation
      await this.getRouter().back();
    } else {
      await this.getRouter().push(fallbackUri, 'back');
      this.lastState = history.state;
    }
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
    const ionRouter = this.getRouter();

    ionRouter.addEventListener('ionRouteDidChange', (e: CustomEvent) => {
      const match = to.match(/(.+)\*$/);

      if (match && e.detail.to.indexOf(match[1]) === 0) {
        // match the beginning of the route
        callback();
      } else if (e.detail.to === to) {
        // exact match
        callback();
      }
    });
  }

  private getRouter() {
    return document.querySelector('ion-router');
  }

  private listen() {
    if (!this.listening) {
      this.listening = true;
      this.lastState = history.state;
      window.addEventListener('popstate', this.onPopState);
    }
  }

  /**
   * A history step this service did not start: the Android back button, or the
   * browser's back and forward buttons. It is a step forward only when it
   * returns to an entry that was left by going back.
   *
   * `ion-router` numbers its entries, but comparing those numbers is not
   * enough: it renumbers an entry that has none (the page the app was opened
   * on) in its own popstate listener, which runs first, so going back to that
   * entry would look like going forward.
   */
  private onPopState = () => {
    const state = history.state;
    const forward = this.forwardStates.lastIndexOf(state);
    if (state !== null && forward !== -1) {
      this.forwardStates.splice(forward, 1);
      this.depth++;
    } else {
      this.forwardStates.push(this.lastState);
      this.depth = Math.max(0, this.depth - 1);
    }
    this.lastState = state;
  };
}

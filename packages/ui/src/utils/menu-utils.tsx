import { h } from '@stencil/core';

/**
 * The start button of a page toolbar: a back button calling `onBack`, or the
 * menu button.
 *
 * Under Ionic 9 there is no `ion-nav` for `ion-back-button` to pop, and without
 * one it only ever navigates to a fixed `default-href`. Pages pass a handler
 * calling the router's `back()` instead, which follows the history -- so a
 * station opened from the map returns to the map -- and takes the page's
 * fallback for when there is nothing to go back to. `default-href="#"` is what
 * makes Ionic show the button while leaving the click to the handler: it
 * ignores hrefs that start with `#`.
 */
export function getMenuButton(enableBackButton: boolean, onBack: () => void, additionalProps = {}) {
  if (enableBackButton) {
    return <ion-back-button text="" default-href="#" onClick={onBack} {...additionalProps}></ion-back-button>;
  } else {
    return <ion-menu-button {...additionalProps}></ion-menu-button>;
  }
}

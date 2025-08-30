import { h } from '@stencil/core';

export function getMenuButton(
  enableBackButton: boolean = false,
  defaultBackButtonHref: string = null,
  additionalProps = {}
) {
  if (enableBackButton && defaultBackButtonHref) {
    return <ion-back-button text="" default-href={defaultBackButtonHref} {...additionalProps}></ion-back-button>;
  } else if (enableBackButton) {
    return <ion-back-button text="" {...additionalProps}></ion-back-button>;
  } else {
    return <ion-menu-button {...additionalProps}></ion-menu-button>;
  }
}
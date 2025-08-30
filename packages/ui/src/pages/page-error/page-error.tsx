import { Component, h, Prop } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-error',
  styleUrl: 'page-error.scss',
  shadow: true,  
})
export class PageError {

  @Prop() facade: ServiceFacade;

  async componentDidLoad() {
    this.facade.getMenuService().disable();
  }

  tryAgain() {
    this
      .facade
      .getRoutingService()
      .pushReplaceCurrent('/');
  }

  render() {
    return (
      <ion-content>
        <div id="error-page">
          <div id="error-page-icon">
            <ion-icon name="radio-outline"></ion-icon>
          </div>
          <div>
            <ion-text>
              <h4>{this.facade.__('no-internet')}</h4>
            </ion-text>
          </div>
          <div>
            <ion-button onClick={() => this.tryAgain()}>
              <ion-icon slot="start" name="refresh-circle"></ion-icon>
              {this.facade.__('try-again')}
            </ion-button>
          </div>
        </div>
      </ion-content>
    );
  }
}

import { Component, Host, Element, h, Prop } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-tabbed-station-list',
  styleUrl: 'page-tabbed-station-list.scss',
  shadow: true,
})
export class PageTabbedStationList {

  @Element() element: HTMLElement;

  /**
   * Background color of the header toolbar, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';

  /**
   * The ID of the tour to display stations for, or null if all stations should be displayed
   */
  @Prop() tourId: string = null;

  @Prop() facade: ServiceFacade;

  async componentWillLoad() {
    await this.facade.getMenuService().enable();
  }

  async componentDidLoad() {
    const tabs: any = this.element.querySelector('ion-tabs');
    if (tabs) {
      await tabs.select('tab-images');
    }
  }

  render() {
    return (
      <Host>
        <ion-tabs>          
          <ion-tab tab="tab-images">
            <sc-page-station-image-list 
              facade={this.facade}
              tourId={this.tourId}
              headerBackgroundColor={this.headerBackgroundColor} />
          </ion-tab>
          <ion-tab tab="tab-list">
            <sc-page-station-list 
              facade={this.facade}
              tourId={this.tourId}
              headerBackgroundColor={this.headerBackgroundColor} />
          </ion-tab>
          <ion-tab-bar slot="bottom">
            <ion-tab-button tab="tab-images">
              <ion-icon name="images"></ion-icon>
            </ion-tab-button>
            <ion-tab-button tab="tab-list">
              <ion-icon name="list"></ion-icon>
            </ion-tab-button>
          </ion-tab-bar>
        </ion-tabs>
      </Host>
    );
  }
}

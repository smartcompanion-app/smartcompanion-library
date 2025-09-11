import { Component, Prop, State, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';
import { Tour, Asset } from '@smartcompanion/data';

@Component({
  tag: 'sc-page-tour-list',
  styleUrl: 'page-tour-list.scss'
})
export class PageTourList {

  @State() tours: Tour[] = [];

  /**
   * Background color of the header toolbard, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';

  @Prop() facade: ServiceFacade;

  async componentWillLoad() {
    this.tours = await this.facade.getTourService().getTours();
    await this.facade.getMenuService().enable();
  }

  getTourStyle(tour: Tour) {
    return {
      'background-image': "url('" + (tour.images[0] as Asset).internalWebUrl + "')"
    };
  }

  startTour(tourId: string) {
    this.facade.getRoutingService().push(`/tours/${tourId}`);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color={this.headerBackgroundColor}>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>{this.facade.__('menu-overview')}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        {this.tours.map(tour =>
          <div style={this.getTourStyle(tour)} class="tour-card">
            <div class="tour-card-transparency"></div>
            <div class="tour-details">
              <div class="tour-title">{tour.title}</div>
              <div class="tour-description">{tour.description}</div>
              <div class="tour-actions">
                <div>
                  <span class="info">
                    <ion-icon name="time-outline"></ion-icon> <strong>{tour.duration}</strong>
                  </span>
                </div>
                <div class="right">
                  <ion-button onClick={() => this.startTour(tour.id)} color="primary" >{this.facade.__('start-tour')}</ion-button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ion-content>
    ];
  }
}   
import { Component, Prop, State, Host, h } from '@stencil/core';
import { PageTourListFacade } from '../../contracts';
import { Tour } from '@smartcompanion/data';
import { getImageUrl } from '../../utils';

@Component({
  tag: 'sc-page-tour-list',
  styleUrl: 'page-tour-list.scss',
})
export class PageTourList {
  @State() tours: Tour[] = [];

  /**
   * Background color of the header toolbar, either 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() headerBackgroundColor: 'primary' | 'secondary' = 'primary';

  /** The service facade instance */
  @Prop() facade: PageTourListFacade;

  async componentWillLoad() {
    this.tours = await this.facade.getTourService().getTours();
    await this.facade.getMenuService().enable();
  }

  /** A tour without an image shows the card's background colour */
  private getTourStyle(tour: Tour) {
    const imageUrl = getImageUrl(tour);
    return imageUrl === undefined ? {} : { 'background-image': "url('" + imageUrl + "')" };
  }

  private startTour(tourId: string) {
    this.facade.getRoutingService().push(`/tours/${tourId}`);
  }

  private handleStartTour = (e: Event) => {
    const tourId = (e.currentTarget as HTMLElement).dataset.tourId;
    if (tourId !== undefined) {
      this.startTour(tourId);
    }
  };

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color={this.headerBackgroundColor}>
            <ion-buttons slot="start">
              <ion-menu-button></ion-menu-button>
            </ion-buttons>
            <ion-title>{this.facade.__('menu-overview')}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          {this.tours.map(tour => (
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
                    <ion-button data-tour-id={tour.id} onClick={this.handleStartTour} color="primary">
                      {this.facade.__('start-tour')}
                    </ion-button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ion-content>
      </Host>
    );
  }
}

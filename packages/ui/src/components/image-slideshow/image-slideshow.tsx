import { Component, h, Prop, Element, Host } from '@stencil/core';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

@Component({
  tag: 'sc-image-slideshow',
  styleUrl: 'image-slideshow.scss',
  shadow: true,
})
export class ImageSlideshow {

  protected imagesList: Swiper;

  @Element() el: HTMLElement;

  /**
   * List of image URLs to display in the slideshow
   */
  @Prop() images: string[] = [];

  componentDidLoad() {
    this.imagesList = new Swiper(this.el.shadowRoot.querySelector('#slideshow') as HTMLElement, {
      modules: [Navigation],
      loop: true,
      navigation: {
        nextEl: this.el.shadowRoot.querySelector('#slideshow-next') as HTMLElement,
        prevEl: this.el.shadowRoot.querySelector('#slideshow-prev') as HTMLElement,
      }
    });
  }

  render() {
    if (this.images?.length > 1) {
      return (
        <Host>
          <div id="slideshow" class="swiper">
            <div class="swiper-wrapper">
              {this.images.map((image) => (
                <div class="swiper-slide">
                  <img class="slideshow-image" src={image} />
                </div>
              ))}
            </div>
            <div id="slideshow-prev" class="slideshow-button">
              <ion-icon name="chevron-back-outline"></ion-icon>
            </div>
            <div id="slideshow-next" class="slideshow-button">
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
          </div>
        </Host>
      );
    } else {
      return (
        <Host>
          <ion-img class="slideshow-image" src={this.images[0]}></ion-img>
        </Host>
      );
    }
  }
}

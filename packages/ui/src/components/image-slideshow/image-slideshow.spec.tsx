import { render, h, describe, it, expect } from '@stencil/vitest';

describe('sc-image-slideshow', () => {
  describe('single image', () => {
    it('should render a single ion-img element', async () => {
      const { root } = await render(<sc-image-slideshow images={['img1.jpg']}></sc-image-slideshow>);

      const img = root.shadowRoot.querySelector('ion-img');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe('img1.jpg');
    });

    it('should not render swiper container for single image', async () => {
      const { root } = await render(<sc-image-slideshow images={['img1.jpg']}></sc-image-slideshow>);

      const swiper = root.shadowRoot.querySelector('#slideshow');
      expect(swiper).toBeNull();
    });
  });

  describe('multiple images', () => {
    it('should render swiper container with slides', async () => {
      const { root } = await render(<sc-image-slideshow images={['img1.jpg', 'img2.jpg', 'img3.jpg']}></sc-image-slideshow>);

      const swiper = root.shadowRoot.querySelector('#slideshow');
      expect(swiper).not.toBeNull();

      const slides = root.shadowRoot.querySelectorAll('.swiper-slide');
      expect(slides.length).toBe(3);
    });

    it('should render navigation buttons', async () => {
      const { root } = await render(<sc-image-slideshow images={['img1.jpg', 'img2.jpg']}></sc-image-slideshow>);

      const prevButton = root.shadowRoot.querySelector('#slideshow-prev');
      const nextButton = root.shadowRoot.querySelector('#slideshow-next');
      expect(prevButton).not.toBeNull();
      expect(nextButton).not.toBeNull();
    });

    it('should render correct image sources in slides', async () => {
      const { root } = await render(<sc-image-slideshow images={['a.jpg', 'b.jpg']}></sc-image-slideshow>);

      const images = root.shadowRoot.querySelectorAll('.swiper-slide img');
      expect(images[0].getAttribute('src')).toBe('a.jpg');
      expect(images[1].getAttribute('src')).toBe('b.jpg');
    });
  });

  describe('empty images', () => {
    it('should render single ion-img with undefined src when images is empty', async () => {
      const { root } = await render(<sc-image-slideshow images={[]}></sc-image-slideshow>);

      const img = root.shadowRoot.querySelector('ion-img');
      expect(img).not.toBeNull();
    });
  });
});
import { render, h, describe, it, expect } from '@stencil/vitest';

// Swiper only initializes against a real DOM, so the multi-image path is covered
// here rather than in the mock-doc snapshot. Slide sizes come from the component's
// own CSS, so the sources only have to be distinguishable -- they never load.
const images = ['a.png', 'b.png', 'c.png'];

const slideshow = (root: HTMLElement) => root.shadowRoot.querySelector('#slideshow');
const activeImage = (root: HTMLElement) => root.shadowRoot.querySelector('.swiper-slide-active img')?.getAttribute('src');
const click = (root: HTMLElement, id: string) => (root.shadowRoot.querySelector(id) as HTMLElement).click();

describe('sc-image-slideshow', () => {
  const renderSlideshow = async () => {
    const { root } = await render(<sc-image-slideshow images={images}></sc-image-slideshow>);
    await expect.poll(() => slideshow(root)?.classList.contains('swiper-initialized')).toBe(true);
    await expect.poll(() => activeImage(root)).toBe('a.png');
    return root;
  };

  it('should initialize swiper over the rendered slides', async () => {
    const root = await renderSlideshow();

    expect(slideshow(root).querySelectorAll('.swiper-slide').length).toBe(images.length);
  });

  it('should show the next image when clicking next', async () => {
    const root = await renderSlideshow();

    click(root, '#slideshow-next');

    await expect.poll(() => activeImage(root)).toBe('b.png');
  });

  it('should loop back to the last image when clicking prev on the first', async () => {
    const root = await renderSlideshow();

    click(root, '#slideshow-prev');

    await expect.poll(() => activeImage(root)).toBe('c.png');
  });
});

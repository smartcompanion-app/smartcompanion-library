import { render, expect, test, h } from '@stencil/vitest';

test('render slideshow with single image', async () => {
  const { root } = await render(<sc-image-slideshow images={['img1.jpg']}></sc-image-slideshow>);
  expect(root).toMatchSnapshot();
});

// Note: multiple images test is skipped because Swiper initialization
// requires real DOM children which are not available in mock-doc.

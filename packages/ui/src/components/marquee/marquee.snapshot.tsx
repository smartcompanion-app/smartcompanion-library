import { render, expect, test, h } from '@stencil/vitest';

test('render inactive marquee', async () => {
  const { root } = await render(<sc-marquee>Sample text content</sc-marquee>);
  expect(root).toMatchSnapshot();
});

test('render active marquee', async () => {
  const { root } = await render(<sc-marquee active={true}>Sample text content</sc-marquee>);
  expect(root).toMatchSnapshot();
});

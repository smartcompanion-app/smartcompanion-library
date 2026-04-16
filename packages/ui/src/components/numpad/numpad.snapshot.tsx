import { render, expect, test, h } from '@stencil/vitest';

test('render numpad without confirm button', async () => {
  const { root } = await render(<sc-numpad></sc-numpad>);
  expect(root).toMatchSnapshot();
});

test('render numpad with confirm button', async () => {
  const { root } = await render(<sc-numpad full={true}></sc-numpad>);
  expect(root).toMatchSnapshot();
});

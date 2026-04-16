import { render, expect, test, h } from '@stencil/vitest';

test('render player controls in default state', async () => {
  const { root } = await render(<sc-player-controls></sc-player-controls>);
  expect(root).toMatchSnapshot();
});

test('render player controls in playing state', async () => {
  const { root } = await render(<sc-player-controls playing={true} position={30} duration={120}></sc-player-controls>);
  expect(root).toMatchSnapshot();
});

test('render player controls in disabled state', async () => {
  const { root } = await render(<sc-player-controls disabled={true}></sc-player-controls>);
  expect(root).toMatchSnapshot();
});

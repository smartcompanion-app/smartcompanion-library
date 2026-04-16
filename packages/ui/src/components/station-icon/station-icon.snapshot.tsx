import { render, expect, test, h } from '@stencil/vitest';


test('render normal station icon 13', async () => {
  const { root } = await render(<sc-station-icon>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render large station icon 13', async () => {
  const { root } = await render(<sc-station-icon size="large">13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render small station icon 13', async () => {
  const { root } = await render(<sc-station-icon size="small">13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render collected station icon 13', async () => {
  const { root } = await render(<sc-station-icon collected={true}>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render 98% collected station icon as collected 13', async () => {
  const { root } = await render(<sc-station-icon collectedPercent={98}>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

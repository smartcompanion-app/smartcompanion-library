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

test('render station icon at lower limit (collectedPercent equals lowerLimitPercent) shows 0% progress', async () => {
  const { root } = await render(<sc-station-icon collectedPercent={3}>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render station icon below lower limit (collectedPercent below lowerLimitPercent) shows 0% progress', async () => {
  const { root } = await render(<sc-station-icon collectedPercent={2}>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render station icon just above lower limit starts showing progress', async () => {
  const { root } = await render(<sc-station-icon collectedPercent={4}>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render station icon with custom lowerLimitPercent at boundary shows 0% progress', async () => {
  const { root } = await render(<sc-station-icon collectedPercent={10} lowerLimitPercent={10}>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

test('render station icon with custom lowerLimitPercent above boundary shows progress', async () => {
  const { root } = await render(<sc-station-icon collectedPercent={15} lowerLimitPercent={10}>13</sc-station-icon>);
  expect(root).toMatchSnapshot();
});

import { render, expect, test, h } from '@stencil/vitest';
import { Menu, PageLanguageFacade } from '../../contracts';

const facade = {
  getMenuService: () =>
    ({
      disable: () => Promise.resolve(),
    }) as Partial<Menu>,
  getLanguages: () => [
    { title: 'English', language: 'en' },
    { title: 'Deutsch', language: 'de' },
    { title: 'Italiano', language: 'it' },
  ],
} as unknown as PageLanguageFacade;

test('render page language with language list', async () => {
  const { root } = await render(<sc-page-language facade={facade}></sc-page-language>);
  expect(root).toMatchSnapshot();
});

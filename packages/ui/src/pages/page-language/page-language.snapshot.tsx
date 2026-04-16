import { render, expect, test, h } from '@stencil/vitest';
import { ServiceFacade, MenuService } from '@smartcompanion/services';

const facade = {
  getMenuService: () => ({
    disable: () => Promise.resolve(),
  }) as Partial<MenuService>,
  getLanguages: () => ([
    { title: 'English', language: 'en' },
    { title: 'Deutsch', language: 'de' },
    { title: 'Italiano', language: 'it' },
  ]),
} as unknown as ServiceFacade;

test('render page language with language list', async () => {
  const { root } = await render(<sc-page-language facade={facade}></sc-page-language>);
  expect(root).toMatchSnapshot();
});

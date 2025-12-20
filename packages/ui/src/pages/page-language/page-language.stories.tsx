import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { PageLanguage } from './page-language';

const meta = {
  title: 'Pages/Page Language',
  tags: ['autodocs'],
  component: PageLanguage,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-language {...args} />
    </div>
  ),
} satisfies Meta<PageLanguage>;

export default meta;

type Story = StoryObj<PageLanguage>;

export const Example: Story = {
  args: {
    facade: {      
      getMenuService: () => ({
        disable: () => {
          console.log('Menu disabled');
          return Promise.resolve();
        },
      }) as MenuService,
      getLanguages: () => ([
        { title: 'English', language: 'en' },
        { title: 'Deutsch', language: 'de' },
        { title: 'Español', language: 'es' },
        { title: 'Français', language: 'fr' },
        { title: 'Italiano', language: 'it' },
      ]),
    } as ServiceFacade,
  },
};


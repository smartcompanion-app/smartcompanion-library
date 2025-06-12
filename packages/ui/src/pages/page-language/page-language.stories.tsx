import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { PageLanguage } from './page-language';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Language',
  tags: ['autodocs'],
  component: PageLanguage,
  render: args => (
    <div style={{width: "320px", height: "500px", border: "1px solid #efefef"}}>
      <sc-page-language facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Example: Story = {
  args: {
    facade: {      
      menu: () => ({
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
    },
  },
};


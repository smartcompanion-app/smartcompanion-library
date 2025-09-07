import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { expect, waitFor } from 'storybook/test';
import { h } from '@stencil/core';
import { ServiceFacade, MenuService } from '@smartcompanion/services';
import { PageSelection } from './page-selection';
import { StationService } from '@smartcompanion/data';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Selection',
  tags: ['autodocs'],
  component: PageSelection,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-selection facade={args.facade as ServiceFacade} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Example: Story = {
  args: {
    facade: {      
      getMenuService: () => ({
        enable: () => {
          console.log('Menu enabled');
          return Promise.resolve();
        },
      }) as MenuService,
      getStationService: () => ({
        getStations: () => {
          return Promise.resolve([]);
        },
      }) as StationService,
      __: (key: string) => {
        switch (key) {
          case 'menu-selection':
            return 'Station Selection';
          default:
            return key;
        }
      },
    },
  },
  play: async ({ canvas, userEvent, step }) => {
    
    await step('Type 4 and 2, check each entry in the input', async () => {
      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-4'));

      await waitFor(async () => {        
        const numpadInput = await canvas.findByTestId('numpad-input');
        expect(numpadInput.textContent).toBe("4");
      });

      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-2'));

      await waitFor(async () => {        
        const numpadInput = await canvas.findByTestId('numpad-input');
        expect(numpadInput.textContent).toBe("42");
      });
    });

    await step('Type 3 on a filled, 2-sized numpad should result in 43', async () => {
      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-3'));

      await waitFor(async () => {        
        const numpadInput = await canvas.findByTestId('numpad-input');
        expect(numpadInput.textContent).toBe("43");
      });
    });

    await step('Deleting numpad input with button', async () => {
      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-delete'));

      await waitFor(async () => {        
        const numpadInput = await canvas.findByTestId('numpad-input');
        expect(numpadInput.textContent).toBe("4");
      });

      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-delete'));

      await waitFor(async () => {        
        const numpadInput = await canvas.findByTestId('numpad-input');
        expect(numpadInput.textContent).toBe("");
      });
    });

    await step('Confirming should delete numpad input', async () => {
      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-4'));
      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-2'));
      // @ts-ignore
      await userEvent.click(await canvas.findByShadowTestId('numpad-button-confirm'));

      await waitFor(async () => {        
        const numpadInput = await canvas.findByTestId('numpad-input');
        expect(numpadInput.textContent).toBe("");
      });
    });

  },
};


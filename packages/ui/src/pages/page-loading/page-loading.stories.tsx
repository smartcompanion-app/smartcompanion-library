import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { ServiceFacade, MenuService, RoutingService } from '@smartcompanion/services';
import { PageLoading } from './page-loading';

type StoryArgs = {
  facade: Partial<ServiceFacade>;
};

const meta: Meta<StoryArgs> = {
  title: 'Pages/Page Loading',
  tags: ['autodocs'],
  component: PageLoading,
  render: args => (
    <div style={{width: "100vw", height: "100vh"}}>
      <sc-page-loading facade={args.facade as ServiceFacade} image={"assets/example-loading.png"} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Example: Story = {
  args: {
    facade: {
      getLoadService: () => {
        let progress = 0;
        return {
          setProgressListener: (listener: (progress: number) => void) => {            
            progress = 0; // Reset progress
            const interval = setInterval(() => {
              progress += 2;
              listener(progress);
              if (progress >= 500) {
                clearInterval(interval);
              }
            }, 100); // Simulate progress every 100ms
          },
          load: () => {
            return new Promise((resolve) => {
              const interval = setInterval(() => {
                if (progress >= 100) {
                  clearInterval(interval);
                  resolve('home'); // Simulate successful load
                }
              }, 500); // Simulate loading
            });
          },
        };
      },
      getMenuService: () => ({
        disable: () => {
          console.log('Menu disabled');
          return Promise.resolve();
        },
      }) as MenuService,
      getRoutingService: () => ({
        addRouteChangeListener: (route: string, callback: () => void) => {
          console.log(`Route change listener added for ${route}`);
          setTimeout(callback, 500); // Simulate route change after 500ms
        },      
      }) as RoutingService
    },    
  },
};


import { render, h, describe, it, expect } from '@stencil/vitest';

describe('sc-marquee', () => {
  describe('inactive state', () => {
    it('should render slot content with ellipsis class when inactive', async () => {
      const { root } = await render(<sc-marquee>Sample text</sc-marquee>);

      const div = root.shadowRoot.querySelector('div');
      expect(div).toHaveClass('ellipsis');
    });
  });

  describe('active state', () => {
    it('should render marquee text without ellipsis class when active', async () => {
      const { root } = await render(<sc-marquee active={true}>Sample text</sc-marquee>);

      const div = root.shadowRoot.querySelector('div');
      expect(div).not.toHaveClass('ellipsis');
    });

    it('should reflect active attribute on host element', async () => {
      const { root } = await render(<sc-marquee active={true}>Sample text</sc-marquee>);

      expect(root.getAttribute('active')).not.toBeNull();
    });
  });
});
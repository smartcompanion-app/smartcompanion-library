import { Component, Prop, Element, Host, h, State } from "@stencil/core";

@Component({
  tag: 'sc-marquee',
  styleUrl: 'marquee.scss',
  shadow: true,
})
export class Marquee {

  originalText: string = "";

  @Prop({ mutable: true, reflect: true }) active: boolean = false;

  @State() marqueeText: string = "";

  @Element() element: HTMLElement;

  componentWillLoad() {
    this.originalText = this.element.textContent;
    this.marqueeText = this.originalText + "   ";
  }

  componentDidRender() {
    const innerElement = this.element.shadowRoot.querySelector('div');
    if (this.active && innerElement.scrollWidth > innerElement.clientWidth) {
      setTimeout(() => {
        this.marqueeText = this.marqueeText.slice(1, this.marqueeText.length) + this.marqueeText.slice(0, 1);
      }, 300);
    }
  }

  disconnectedCallback() {
    this.active = false;
  }

  render() {
    return (
      <Host>
        {this.active
          ? <div>{this.marqueeText}</div>
          : <div class="ellipsis"><slot /></div>
        }
      </Host>
    );
  }
}
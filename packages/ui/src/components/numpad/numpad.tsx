import { Component, Event, Prop, EventEmitter, Host, h } from "@stencil/core";

@Component({
  tag: 'sc-numpad',
  styleUrl: 'numpad.scss',
  shadow: true,
})
export class Numpad {

  /**
   * Enable the confirm button
   */
  @Prop() full: boolean = false;

  /** Emitted when the delete button is pressed */
  @Event() delete: EventEmitter<void>;
  /** Emitted when the confirm button is pressed */
  @Event() confirm: EventEmitter<void>;
  /** Emitted when a number button is pressed */
  @Event() number: EventEmitter<number>;

  private handleNumber = (e: Event) => {
    const raw = (e.currentTarget as HTMLElement).dataset.value;
    const value = parseInt(raw, 10);
    if (!isNaN(value)) {
      this.number.emit(value);
    }
  };

  private handleDelete = () => {
    this.delete.emit();
  };

  private handleConfirm = () => {
    this.confirm.emit();
  };

  render() {
    return (
      <Host>
        <ion-fab-button data-testid="numpad-button-1" data-value="1" onClick={this.handleNumber}>1</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-2" data-value="2" onClick={this.handleNumber}>2</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-3" data-value="3" onClick={this.handleNumber}>3</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-4" data-value="4" onClick={this.handleNumber}>4</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-5" data-value="5" onClick={this.handleNumber}>5</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-6" data-value="6" onClick={this.handleNumber}>6</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-7" data-value="7" onClick={this.handleNumber}>7</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-8" data-value="8" onClick={this.handleNumber}>8</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-9" data-value="9" onClick={this.handleNumber}>9</ion-fab-button>
        <ion-fab-button data-testid="numpad-button-delete" onClick={this.handleDelete}>
          <ion-icon name="backspace-outline"></ion-icon>
        </ion-fab-button>
        <ion-fab-button data-testid="numpad-button-0" data-value="0" onClick={this.handleNumber}>0</ion-fab-button>
        {this.full &&
          <ion-fab-button data-testid="numpad-button-confirm" onClick={this.handleConfirm}>
            <ion-icon name="send-outline"></ion-icon>
          </ion-fab-button>
        }
      </Host>
    );
  }
}
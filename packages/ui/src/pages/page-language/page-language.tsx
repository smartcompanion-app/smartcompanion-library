import { Component, Prop, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-language',
  styleUrl: 'page-language.css',
  shadow: true,
})
export class PageLanguage {

  /** The service facade instance */
  @Prop() facade: ServiceFacade;

  async componentDidLoad() {
    this.facade.getMenuService().disable();
  }

  private changeLanguage(languageCode: string) {
    this.facade.changeLanguage(languageCode);
    this.facade.getRoutingService().pushReplaceCurrent('/');
  }

  private handleChangeLanguage = (e: Event) => {
    const languageCode = (e.currentTarget as HTMLElement).dataset.language;
    this.changeLanguage(languageCode);
  };

  render() {
    const languages = this.facade.getLanguages();

    return [
      <ion-header class="ion-no-border">
        <ion-toolbar></ion-toolbar>
      </ion-header>,
      <ion-content>
        { languages.map((language =>
          <ion-button data-language={language.language} onClick={this.handleChangeLanguage} expand="block" size="large">
            { language.title }
          </ion-button>
        )) }
      </ion-content>
    ];
  }
}

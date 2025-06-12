import { Component, Prop, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-language',
  styleUrl: 'page-language.css',
  shadow: true,
})
export class PageLanguage {

  @Prop() facade: ServiceFacade;

  async componentDidLoad() {
    this.facade.menu().disable();
  }

  changeLanguage(languageCode: string) {
    // TODO, add to facade: this.facade.data().clearCollectionPercentage(languageCode);    
    this.facade.changeLanguage(languageCode);
    this.facade.routing().pushReplaceCurrent('/');
  }

  render() {
    const languages = this.facade.getLanguages();

    return [
      <ion-header class="ion-no-border">
        <ion-toolbar></ion-toolbar>
      </ion-header>,
      <ion-content>
        { languages.map((language => 
          <ion-button onClick={() => this.changeLanguage(language.language)} expand="block" size="large">
            { language.title }
          </ion-button>
        )) }
      </ion-content>
    ];
  }
}

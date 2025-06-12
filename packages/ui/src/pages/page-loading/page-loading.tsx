import { Component, Prop, State, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-loading',
  styleUrl: 'page-loading.scss',
})
export class PageLoading {

  @Prop() facade: ServiceFacade;

  @Prop() image: string;

  @State() progress: number = 1;

  async componentWillLoad() {
    this.facade.routing().addRouteChangeListener('/', () => {
      this.loading();
    });
  }

  async loading() {
    this.facade.menu().disable();

    this.facade.load().setProgressListener((progress) => {
      this.progress = progress / 100;
    });

    const result = await this.facade.load().load();
    console.log("loading result", result);

    if (result == 'language') {
      this.facade.routing().pushReplaceCurrent('/language');
    } else if (result == 'home') {
      this.facade.routing().pushReplaceCurrent('/stations/0');
    } else {
      this.facade.routing().pushReplaceCurrent('/error');
    }
  }

  render() {
    return (
      <ion-content>
        <div id="loading">
          <div id="loading-image" >
            <img src={ this.image }></img>
          </div>
          <div id="loading-info">
            {this.progress >= 1
              ? <ion-spinner></ion-spinner>
              : [
                <ion-text>
                  <h4>Loading {this.progress >= 1 ? '' : ((Math.trunc(this.progress * 100)) + '%')}</h4>
                </ion-text>,
                <ion-progress-bar value={this.progress}></ion-progress-bar>
              ]
            }
          </div>
        </div>
      </ion-content>
    );
  }
}

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
    this.facade
      .getRoutingService()
      .addRouteChangeListener('/', () => {
        this.loading();
      });
  }

  async loading() {
    this.facade.getMenuService().disable();

    this.facade.getLoadService().setProgressListener((progress) => {
      this.progress = progress / 100;
    });

    const result = await this.facade.getLoadService().load();
    console.log("loading result", result);

    if (result == 'language') {
      this.facade.getRoutingService().pushReplaceCurrent('/language');
    } else if (result == 'home') {
      this.facade.getRoutingService().pushReplaceCurrent('/stations/0');
    } else if (result == 'pin') {
      this.facade.getRoutingService().pushReplaceCurrent('/pin');
    } else {
      this.facade.getRoutingService().pushReplaceCurrent('/error');
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

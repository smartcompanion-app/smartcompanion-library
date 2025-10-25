import { Component, Prop, State, h } from '@stencil/core';
import { ServiceFacade } from '@smartcompanion/services';

@Component({
  tag: 'sc-page-loading',
  styleUrl: 'page-loading.scss',
})
export class PageLoading {

  @State() progress: number = 1;

  /**
   * Loading Spinner Color 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() spinnerColor: 'primary' | 'secondary' = 'primary';
 
  /**
   * Loading Progress Bar Color 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() progressBarColor: 'primary' | 'secondary' = 'primary';

  /**
   * Loading Text Color 'primary' or 'secondary' (default: 'primary')
   */
  @Prop() loadingTextColor: 'primary' | 'secondary' = 'primary';

  /**
   * The image to display while loading
   */
  @Prop() image: string;
  
  /**
   * The default or home route, when loading is successfully completed
   */
  @Prop() homeRoute: string = "/stations/default";

  @Prop() facade: ServiceFacade;

  async componentWillLoad() {
    this.load();
  }

  async load() {
    this.facade.getMenuService().disable();
    this.progress = 1;

    this.facade.getLoadService().setProgressListener((progress) => {
      this.progress = progress / 100;
    });

    const result = await this.facade.getLoadService().load();
    console.log("loading result", result);

    if (result == 'language') {
      this.facade.getRoutingService().pushReplace('/language');
    } else if (result == 'home') {
      const pendingRoute = this.facade.getPendingRoute();
      this.facade.getRoutingService().pushReplace(pendingRoute || this.homeRoute);
    } else if (result == 'pin') {
      this.facade.getRoutingService().pushReplace('/pin');
    } else {
      this.facade.getRoutingService().pushReplace('/error');
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
              ? <ion-spinner color={this.spinnerColor}></ion-spinner>
              : [
                <ion-text color={this.loadingTextColor}>
                  <h4>Loading {this.progress >= 1 ? '' : ((Math.trunc(this.progress * 100)) + '%')}</h4>
                </ion-text>,
                <ion-progress-bar color={this.progressBarColor} value={this.progress}></ion-progress-bar>
              ]
            }
          </div>
        </div>
      </ion-content>
    );
  }
}

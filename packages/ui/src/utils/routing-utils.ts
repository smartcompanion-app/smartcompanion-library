import { ServiceFacade } from '@smartcompanion/services';

export function openStation(facade: ServiceFacade, stationId: string, tourId: string = null) {
  if (tourId === null || tourId === undefined || tourId === '') {
    facade.getRoutingService().push(`/stations/${stationId}`);
  } else {
    facade.getRoutingService().push(`/tours/${tourId}/stations/${stationId}`);
  }
}

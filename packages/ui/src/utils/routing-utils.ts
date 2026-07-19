import { Router } from '../contracts';

export function openStation(facade: { getRoutingService(): Router }, stationId: string, tourId: string = null) {
  if (tourId === null || tourId === undefined || tourId === '') {
    facade.getRoutingService().push(`/stations/${stationId}`);
  } else {
    facade.getRoutingService().push(`/tours/${tourId}/stations/${stationId}`);
  }
}

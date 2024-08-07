import * as Location from 'expo-location';
import { BehaviorSubject } from 'rxjs';

export class LocationService {
  static instance: LocationService;
  readonly error$ = new BehaviorSubject('');
  readonly locationData$ = new BehaviorSubject<Location.LocationObjectCoords>({
    accuracy: 0,
    altitude: 0,
    altitudeAccuracy: 0,
    heading: 0,
    latitude: 0,
    longitude: 0,
    speed: 0,
  });

  /**
   * This is a good use case for a singleton service, as it will be used to for accessing
   * data that essentially will always be the same regardless of when and what is consuming this
   * service.
   */
  static getInstance(): LocationService {
    return LocationService.instance ? this.instance : (LocationService.instance = new LocationService());
  }

  constructor() {
    this.requestLocationPermission();
  }

  async requestLocationPermission(): Promise<void> {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== Location.PermissionStatus.GRANTED) {
      return this.error$.next('Permission to access location was denied');
    }

    this.locationData$.next((await Location.getCurrentPositionAsync({})).coords);
  }
}

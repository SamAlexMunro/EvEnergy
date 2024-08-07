import * as Location from 'expo-location';
import { BehaviorSubject } from 'rxjs';

export class LocationService {
  static instance: LocationService;
  error$ = new BehaviorSubject('');
  locationData$ = new BehaviorSubject<Location.LocationObjectCoords>({
    accuracy: 0,
    altitude: 0,
    altitudeAccuracy: 0,
    heading: 0,
    latitude: 0,
    longitude: 0,
    speed: 0,
  });

  static getInstance(): LocationService {
    return LocationService.instance ? this.instance : (LocationService.instance = new LocationService());
  }

  constructor() {
    this.requestLocationPermission();
  }

  async requestLocationPermission(): Promise<void> {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return this.error$.next('Permission to access location was denied');
    }

    this.locationData$.next((await Location.getCurrentPositionAsync({})).coords);
  }
}

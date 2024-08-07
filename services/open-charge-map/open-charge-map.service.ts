import { BehaviorSubject, combineLatest, debounceTime, mergeMap } from 'rxjs';
import { limitArraySize } from '../../utils/limit-array-size';
import { HttpService } from '../http-service/http.service';

interface AddressInfo {
  AccessComments: string | null;
  AddressLine1: string;
  AddressLine2: string | null;
  ContactEmail: string | null;
  ContactTelephone1: string;
  ContactTelephone2: string | null;
  Country: string | null;
  CountryID: number;
  Distance: number | null;
  DistanceUnit: number;
  ID: number;
  Latitude: number;
  Longitude: number;
  Postcode: string;
  RelatedURL: string;
  StateOrProvince: string | null;
  Title: string;
  Town: string | null;
}

interface Connection {
  Amps: number;
  Comments: string | null;
  ConnectionType: string | null;
  ConnectionTypeID: number;
  CurrentType: string | null;
  CurrentTypeID: number | null;
  ID: number;
  Level: string | null;
  LevelID: number;
  PowerKW: number;
  Quantity: number;
  Reference: string | null;
  StatusType: string | null;
  StatusTypeID: number;
  Voltage: number;
}

interface ChargePoint {
  AddressInfo: AddressInfo;
  Connections: Connection[];
  DataProvider: string | null;
  DataProviderID: number;
  DataProvidersReference: string | null;
  DataQualityLevel: number;
  DateCreated: string;
  DateLastConfirmed: string | null;
  DateLastStatusUpdate: string;
  DateLastVerified: string;
  DatePlanned: string | null;
  GeneralComments: string;
  ID: number;
  IsRecentlyVerified: boolean;
  MediaItems: string | null;
  MetadataValues: string | null;
  NumberOfPoints: number;
  OperatorID: number;
  OperatorInfo: string | null;
  OperatorsReference: string | null;
  ParentChargePointID: number | null;
  PercentageSimilarity: number | null;
  StatusType: string | null;
  StatusTypeID: number;
  SubmissionStatus: string | null;
  SubmissionStatusTypeID: number;
  UUID: string;
  UsageCost: string;
  UsageType: string | null;
  UsageTypeID: number;
  UserComments: string | null;
}

export interface ChargePointProperties {
  charging: boolean;
  id: number;
  latitude: number;
  longitude: number;
}

export interface MapBoundaries {
  northEast: { latitude: number; longitude: number };
  southWest: { latitude: number; longitude: number };
}

const OPEN_CHARGE_MAP_API_KEY = 'ac2e74af-b6c6-421b-aa8a-c7b4d3f0635c';

export class OpenChargeMapService {
  static instance: OpenChargeMapService;
  /**
   * This is a good use case for a singleton service, as it will be used to for accessing
   * data that essentially will always be the same regardless of when and what is consuming this
   * service.
   */
  static getInstance(): OpenChargeMapService {
    return OpenChargeMapService.instance ? this.instance : (OpenChargeMapService.instance = new OpenChargeMapService());
  }

  constructor(private readonly httpService: HttpService = new HttpService()) {
    this.error$ = httpService.error$;
    this.loading$ = httpService.loading$;

    /**
     * Listens to any state change from the boundingBox or cameraZoom and updates the PoiList
     * accordingly.
     *
     * CombineLatest documentation - https://www.learnrxjs.io/learn-rxjs/operators/combination/combinelatest
     */
    combineLatest([this.mapsBoundingBox$, this.cameraZoom$])
      .pipe(
        debounceTime(300),
        mergeMap((values) => this.retrievePoiList(values[0], values[1]))
      )
      .subscribe();
  }

  readonly poiList$ = new BehaviorSubject<ChargePoint[]>([]);
  readonly chargingPoints$ = new BehaviorSubject<ChargePointProperties[]>([]);
  readonly cameraZoom$ = new BehaviorSubject(0);
  readonly loading$: BehaviorSubject<boolean>;
  readonly mapsBoundingBox$ = new BehaviorSubject<MapBoundaries>({
    northEast: { latitude: 0, longitude: 0 },
    southWest: { latitude: 0, longitude: 0 },
  });
  readonly error$: BehaviorSubject<string>;

  updateCameraZoom(cameraZoom: number): void {
    this.cameraZoom$.next(cameraZoom);
  }

  updateMapsBoundingBox(mapsBoundingBox: MapBoundaries): void {
    this.mapsBoundingBox$.next(mapsBoundingBox);
  }

  async retrievePoiList(mapsBoundingBox: MapBoundaries, zoom: number): Promise<void> {
    const params = new URLSearchParams({
      compact: 'true',
      maxresults: '30000',
      boundingbox: `(${mapsBoundingBox.northEast.latitude}, ${mapsBoundingBox.northEast.longitude}),(${mapsBoundingBox.southWest.latitude}, ${mapsBoundingBox.southWest.longitude})`,
    });

    const response = await this.httpService.get<ChargePoint[]>({
      url: `https://api.openchargemap.io/v3/poi?key=${OPEN_CHARGE_MAP_API_KEY}&${params.toString()}`,
    });

    if (!response) return;
    this.poiList$.next(response);
    /**
     * It looks like when we define a boundingBox the way open charge map API returns the results is in some form of
     * chronological order based on a particular starting location.
     *
     * Without essentially trimming out the array while keeping an even distribution of the results, we either render
     * everything which is bad for performance and UX, or we limit the results and end up with clumps of charging points located at
     * one geographics area of the map and the remainder of the map left empty.
     *
     * If the zoom of the map is less than 13.5 we want to apply this pruning logic, otherwise we can safely assume that there
     * isn't going to be 1000's of results within a smaller area, while we also want to retain the displayed markers for UX purposes at this
     * level of zoom.
     *
     * Ideally given more time this is where I'd put most of my effort in establishing a refined solution that groups nearby charging ports
     * into a singular marker at distance, and reveals them accordingly depending on the zoom level.
     */
    const chargingCoordinates = zoom < 13.5 ? limitArraySize(response) : response;

    this.chargingPoints$.next(
      chargingCoordinates.map((chargePoint) => {
        const { Latitude, Longitude, ID } = chargePoint.AddressInfo;
        /**
         * Some psuedo logic on what I would expect an API to return if we wanted to track the charging
         * behavior/status through a complete BE service, the addition of the charging and ID fields would
         * be an ideal approach to start with.
         */
        return {
          latitude: Latitude,
          longitude: Longitude,
          charging: false,
          id: ID,
        };
      })
    );
  }
}

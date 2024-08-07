import { BehaviorSubject } from 'rxjs';
import { HttpService } from '../http-service/http.service';

interface AddressInfo {
  ID: number;
  Title: string;
  AddressLine1: string;
  AddressLine2: string | null;
  Town: string | null;
  StateOrProvince: string | null;
  Postcode: string;
  CountryID: number;
  Country: string | null;
  Latitude: number;
  Longitude: number;
  ContactTelephone1: string;
  ContactTelephone2: string | null;
  ContactEmail: string | null;
  AccessComments: string | null;
  RelatedURL: string;
  Distance: number | null;
  DistanceUnit: number;
}

interface Connection {
  ID: number;
  ConnectionTypeID: number;
  ConnectionType: string | null;
  Reference: string | null;
  StatusTypeID: number;
  StatusType: string | null;
  LevelID: number;
  Level: string | null;
  Amps: number;
  Voltage: number;
  PowerKW: number;
  CurrentTypeID: number | null;
  CurrentType: string | null;
  Quantity: number;
  Comments: string | null;
}

interface ChargePoint {
  DataProvider: string | null;
  OperatorInfo: string | null;
  UsageType: string | null;
  StatusType: string | null;
  SubmissionStatus: string | null;
  UserComments: string | null;
  PercentageSimilarity: number | null;
  MediaItems: string | null;
  IsRecentlyVerified: boolean;
  DateLastVerified: string;
  ID: number;
  UUID: string;
  ParentChargePointID: number | null;
  DataProviderID: number;
  DataProvidersReference: string | null;
  OperatorID: number;
  OperatorsReference: string | null;
  UsageTypeID: number;
  UsageCost: string;
  AddressInfo: AddressInfo;
  Connections: Connection[];
  NumberOfPoints: number;
  GeneralComments: string;
  DatePlanned: string | null;
  DateLastConfirmed: string | null;
  StatusTypeID: number;
  DateLastStatusUpdate: string;
  MetadataValues: string | null;
  DataQualityLevel: number;
  DateCreated: string;
  SubmissionStatusTypeID: number;
}

const OPEN_CHARGE_MAP_API_KEY = 'ac2e74af-b6c6-421b-aa8a-c7b4d3f0635c';

export class OpenChargeMapService {
  constructor(private readonly httpService: HttpService = new HttpService()) {
    this.retrievePoiList();
    this.error$ = httpService.error$;
  }

  poiList$ = new BehaviorSubject<ChargePoint[]>([]);
  error$: BehaviorSubject<string>;

  async retrievePoiList() {
    const params = new URLSearchParams({
      compact: 'true',
    });

    const response = await this.httpService.get<ChargePoint[]>({
      url: `https://api.openchargemap.io/v3/poi?key=${OPEN_CHARGE_MAP_API_KEY}&${params.toString()}`,
    });
    console.log(response);
    if (!response) return;
    this.poiList$.next(response);
  }
}

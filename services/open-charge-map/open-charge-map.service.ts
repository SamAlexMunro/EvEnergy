import { BehaviorSubject } from 'rxjs';
import { HttpService } from '../http-service/http.service';

interface DataProviderStatusType {
  IsProviderEnabled: boolean;
  ID: number;
  Title: string;
}

interface DataProvider {
  WebsiteURL: string;
  Comments: string | null;
  DataProviderStatusType: DataProviderStatusType;
  IsRestrictedEdit: boolean;
  IsOpenDataLicensed: boolean;
  IsApprovedImport: boolean;
  License: string;
  DateLastImported: string | null;
  ID: number;
  Title: string;
}

interface OperatorInfo {
  WebsiteURL: string;
  Comments: string;
  PhonePrimaryContact: string | null;
  PhoneSecondaryContact: string | null;
  IsPrivateIndividual: boolean;
  AddressInfo: string | null;
  BookingURL: string | null;
  ContactEmail: string | null;
  FaultReportEmail: string | null;
  IsRestrictedEdit: boolean;
  ID: number;
  Title: string;
}

interface UsageType {
  IsPayAtLocation: boolean;
  IsMembershipRequired: boolean;
  IsAccessKeyRequired: boolean;
  ID: number;
  Title: string;
}

interface StatusType {
  IsOperational: boolean;
  IsUserSelectable: boolean;
  ID: number;
  Title: string;
}

interface SubmissionStatus {
  IsLive: boolean;
  ID: number;
  Title: string;
}

interface Country {
  ISOCode: string;
  ContinentCode: string;
  ID: number;
  Title: string;
}

interface AddressInfo {
  ID: number;
  Title: string;
  AddressLine1: string;
  AddressLine2: string | null;
  Town: string | null;
  StateOrProvince: string;
  Postcode: string;
  CountryID: number;
  Country: Country;
  Latitude: number;
  Longitude: number;
  ContactTelephone1: string | null;
  ContactTelephone2: string | null;
  ContactEmail: string | null;
  AccessComments: string | null;
  RelatedURL: string | null;
  Distance: number | null;
  DistanceUnit: number;
}

interface ConnectionType {
  FormalName: string;
  IsDiscontinued: boolean;
  IsObsolete: boolean;
  ID: number;
  Title: string;
}

interface StatusTypeConnection {
  IsOperational: boolean;
  IsUserSelectable: boolean;
  ID: number;
  Title: string;
}

interface Level {
  Comments: string;
  IsFastChargeCapable: boolean;
  ID: number;
  Title: string;
}

interface CurrentType {
  Description: string;
  ID: number;
  Title: string;
}

interface Connection {
  ID: number;
  ConnectionTypeID: number;
  ConnectionType: ConnectionType;
  Reference: string | null;
  StatusTypeID: number;
  StatusType: StatusTypeConnection;
  LevelID: number;
  Level: Level;
  Amps: number;
  Voltage: number;
  PowerKW: number;
  CurrentTypeID: number;
  CurrentType: CurrentType;
  Quantity: number;
  Comments: string;
}

interface ChargePoint {
  DataProvider: DataProvider;
  OperatorInfo: OperatorInfo;
  UsageType: UsageType;
  StatusType: StatusType;
  SubmissionStatus: SubmissionStatus;
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
  GeneralComments: string | null;
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
    const response = await this.httpService.get<ChargePoint[]>({
      url: `https://api.openchargemap.io/v3/poi?key=${OPEN_CHARGE_MAP_API_KEY}`,
    });
    if (!response) return;
    this.poiList$.next(response);
  }
}

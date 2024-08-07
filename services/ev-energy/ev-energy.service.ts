import { BehaviorSubject } from 'rxjs';
import { HttpService } from '../http-service/http.service';
import { ChargePointProperties } from '../open-charge-map/open-charge-map.service';

interface ChargingSession {
  car_id: number;
  charger_id: number;
  charging: boolean;
  id: string;
  user: number;
}

const BASE_URL = '192.168.0.242';

export class EvEnergyService {
  static instance: EvEnergyService;
  readonly error$: BehaviorSubject<string>;
  readonly loading$: BehaviorSubject<boolean>;
  readonly chargingSessions$ = new BehaviorSubject<ChargingSession[]>([]);

  static getInstance(): EvEnergyService {
    return EvEnergyService.instance ? this.instance : (EvEnergyService.instance = new EvEnergyService());
  }

  constructor(private readonly httpService: HttpService = new HttpService()) {
    this.error$ = httpService.error$;
    this.loading$ = httpService.loading$;
    this.getChargingSessions();
  }

  findExistingChargingSession(selectedChargingPoint?: ChargePointProperties): ChargingSession | undefined {
    const existingSession = this.chargingSessions$.value.find(
      (chargingSession) => chargingSession.id === `${selectedChargingPoint?.id}`
    );
    return existingSession;
  }

  async updateChargingSession(selectedChargingPoint?: ChargePointProperties): Promise<void> {
    if (!selectedChargingPoint) return;
    const existingSession = this.findExistingChargingSession(selectedChargingPoint);
    existingSession
      ? await this._updateChargingSession(existingSession)
      : await this.createChargingSession(selectedChargingPoint);
    await this.getChargingSessions();
  }

  async getChargingSessions(): Promise<void> {
    const chargingSessions = await this.httpService.get<ChargingSession[]>({
      url: `http://${BASE_URL}:3000/chargingsession/`,
    });
    if (!chargingSessions) return;
    this.chargingSessions$.next(chargingSessions);
  }

  private async _updateChargingSession(selectedChargingPoint: ChargingSession): Promise<void> {
    await this.httpService.put({
      url: `http://${BASE_URL}:3000/chargingsession/${selectedChargingPoint.id}`,
      body: {
        charging: !selectedChargingPoint.charging,
      },
    });
  }

  private async createChargingSession(selectedChargingPoint: ChargePointProperties): Promise<void> {
    await this.httpService.post({
      url: `http://${BASE_URL}:3000/chargingsession`,
      body: {
        car_id: 1,
        charger_id: selectedChargingPoint.id,
        charging: true,
        id: `${selectedChargingPoint.id}`,
        user: 1,
      },
    });
  }
}

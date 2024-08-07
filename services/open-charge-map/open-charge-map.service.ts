import { HttpService } from '../http-service/http.service';

const OPEN_CHARGE_MAP_API_KEY = 'ac2e74af-b6c6-421b-aa8a-c7b4d3f0635c';

export class OpenChargeMapService {
  constructor(private readonly HttpService: HttpService) {
    this.retrievePoiList();
  }

  async retrievePoiList() {
    const response = await this.HttpService.get({
      url: `https://api.openchargemap.io/v3/poi?key=${OPEN_CHARGE_MAP_API_KEY}`,
    });
    console.log(response);
  }
}

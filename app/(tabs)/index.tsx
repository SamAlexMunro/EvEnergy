import { StyleSheet } from 'react-native';

import { onInit } from '../../lifecycle-hooks/on-init';
import { HttpService } from '../../services/http-service/http.service';
import { OpenChargeMapService } from '../../services/open-charge-map/open-charge-map.service';

interface HomePageProperties {
  openChargeService: OpenChargeMapService;
}

/**
 * Passing down the service as argument allows us to leverage dependency injection,
 * which is powerful when needing to lift out a service for a new one assuming a shared contract
 * can be established, and for mocking said services when unit testing.
 */
export default function HomeScreen({
  openChargeService = new OpenChargeMapService(new HttpService()),
}: HomePageProperties) {
  onInit(() => openChargeService.retrievePoiList());

  return <></>;
}

const styles = StyleSheet.create({});

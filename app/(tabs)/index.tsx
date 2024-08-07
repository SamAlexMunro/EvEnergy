import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/build/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';
import { useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { If } from '../../components/if.component';
import { EvEnergyService } from '../../services/ev-energy/ev-energy.service';
import { LocationService } from '../../services/location-service/location.service';
import { ChargePointProperties, OpenChargeMapService } from '../../services/open-charge-map/open-charge-map.service';
import { useSubject } from '../../state-hooks/useSubject';

interface HomePageProperties {
  openChargeService: OpenChargeMapService;
  locationService: LocationService;
  evEnergyService: EvEnergyService;
}

/**
 * Passing down services as arguments allows us to leverage dependency injection,
 * which is powerful when needing to lift out a service for a new one assuming a shared contract
 * can be established, and for mocking said services when unit testing.
 */
export default function HomeScreen({
  openChargeService = OpenChargeMapService.getInstance(),
  locationService = LocationService.getInstance(),
  evEnergyService = EvEnergyService.getInstance(),
}: HomePageProperties) {
  const [chargingModalVisible, setChargingModalVisibility] = useState(false);
  const [selectedChargingPoint, setSelectedChargingPoint] = useState<ChargePointProperties>();

  /**
   * Leveraging the use of RxJS in tandem with a bespoke useState hook behind the scenes allows for
   * a reactive approach in how we handle data, while enabling a good level of seperation of concerns
   * between business logic and components view logic.
   */
  const chargingPoints$ = useSubject(openChargeService.chargingPoints$);
  const evEnergyLoading$ = useSubject(evEnergyService.loading$);
  const locationData$ = useSubject(locationService.locationData$);

  /**
   * Required to access some of the native methods on the Expo Map library
   * Further documentation can be found here - https://github.com/react-native-maps/react-native-maps
   */
  const mapView = useRef<any>();

  const updateMapBoundaries = async (): Promise<void> => {
    const mapBoundaries = await mapView.current.getMapBoundaries();
    openChargeService.updateMapsBoundingBox(mapBoundaries);
  };

  return (
    <View style={styles.container}>
      <If condition={chargingModalVisible}>
        <TouchableOpacity onPress={() => setChargingModalVisibility(false)} style={styles.backdrop}>
          <View style={styles.chargingModal}>
            <Text>
              {`Would you like to ${
                evEnergyService.findExistingChargingSession(selectedChargingPoint)?.charging ? 'STOP' : 'START'
              } charging`}
            </Text>
            <Button title="Cancel" onPress={() => setChargingModalVisibility(false)} />
            <Button
              title="Confirm"
              onPress={async () => {
                await evEnergyService.updateChargingSession(selectedChargingPoint);
                setChargingModalVisibility(false);
              }}
            />
          </View>
        </TouchableOpacity>
      </If>

      <If condition={evEnergyLoading$}>
        <View style={styles.backdrop}>
          <ActivityIndicator />
        </View>
      </If>

      <If condition={locationData$.latitude > 0}>
        <MapView
          initialRegion={{
            latitude: locationData$.latitude,
            longitude: locationData$.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }}
          ref={mapView}
          onLayout={async () => await updateMapBoundaries()}
          onPanDrag={async () => {
            const camera = await mapView.current.getCamera();
            openChargeService.updateCameraZoom(camera.zoom);
            await updateMapBoundaries();
          }}
          style={styles.map}
        >
          {chargingPoints$.map((chargingCoordinates, index) => {
            const { latitude, longitude } = chargingCoordinates;
            return (
              <Marker
                onPress={() => {
                  setSelectedChargingPoint(chargingCoordinates);
                  setChargingModalVisibility(true);
                }}
                tracksViewChanges={false}
                key={index}
                coordinate={{ latitude, longitude }}
              >
                <View style={styles.tooltip}>
                  <MaterialCommunityIcons
                    name="tooltip"
                    size={50}
                    color={
                      evEnergyService.findExistingChargingSession(chargingCoordinates)?.charging ? 'green' : 'black'
                    }
                  />
                  <MaterialIcons style={styles.electricBolt} name="electric-bolt" size={24} color="white" />
                </View>
              </Marker>
            );
          })}
        </MapView>
      </If>

      <If condition={locationData$.latitude === 0}>
        <ActivityIndicator />
      </If>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#00000099',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },

  chargingModal: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    gap: 12,
    padding: 24,
    position: 'absolute',
  },

  container: {
    flex: 1,
  },

  map: {
    height: '100%',
    width: '100%',
  },

  electricBolt: {
    left: '45%',
    position: 'absolute',
    top: '38%',
  },

  tooltip: {
    padding: 10,
  },
});

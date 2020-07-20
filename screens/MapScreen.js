import React, { useEffect, useState } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ActivityIndicator,
  Button,
  Dimensions,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import TrackingList from '../components/TrackingList';
import idGenerator from '../utils/idGenerator';
import keys from '../env';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [startLocation, setStartLocation] = useState();
  const [wayPoints, setWayPoints] = useState([]);
  const [remainingWayPoints, setRemainingWayPoints] = useState([]);
  const [showRoute, setShowRoute] = useState(false);
  const [userCoordsArray, setUserCoordsArray] = useState([]);
  const [liveTracking, setLiveTracking] = useState(true);

  useEffect(() => {
    getLocationAsync();
  }, []);

  useEffect(() => {
    const watchID = navigator.geolocation.watchPosition(
      (lastPosition) => {
        if (liveTracking) {
          setUserCoordsArray((prevCoords) => [
            ...prevCoords,
            {
              latitude: lastPosition.coords.latitude,
              longitude: lastPosition.coords.longitude,
            },
          ]);
        }
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 500,
        // distanceFilter: 1,
      }
    );

    return () => navigator.geolocation.clearWatch(watchID);
  }, [liveTracking]);

  const completedWayPointHandler = (wayPoint) => {
    const updatedWayPoints = remainingWayPoints.filter(
      (point) => point.id !== wayPoint.id
    );

    setRemainingWayPoints(updatedWayPoints);
  };

  const toggleLiveTrackingHandler = () => {
    setUserCoordsArray([]);
    setLiveTracking(!liveTracking);
  };

  const calculateBestRoute = async () => {
    const location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    const { latitude, longitude } = location.coords;

    setStartLocation({ latitude, longitude });
    setShowRoute(true);
  };

  async function getLocationAsync() {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
      });
      const { latitude, longitude } = location.coords;
      setStartLocation({ latitude, longitude });
      setIsLoading(false);
    } else {
      throw new Error('Location permission not granted');
    }
  }

  const addNewWaypointHandler = async (event) => {
    if (wayPoints.length >= 5) {
      Alert.alert(
        'Maximum Waypoints',
        'You have already added the maximum of 5 waypoints',
        [{ text: 'OK' }]
      );
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${keys.googleMapApiKey}`
    );
    const resData = await response.json();
    const streetAddress = resData.results[0].formatted_address;

    const selectedLocation = {
      latitude,
      longitude,
      id: idGenerator(),
      completed: false,
      streetAddress,
    };

    setRemainingWayPoints((prevWayPoints) => [
      ...prevWayPoints,
      selectedLocation,
    ]);
    setWayPoints((prevWayPoints) => [...prevWayPoints, selectedLocation]);
  };

  const markAsCompletedHandler = (wayPoint) => {
    const updatedWayPoints = wayPoints.map((point) =>
      point.id === wayPoint.id ? { ...point, completed: true } : { ...point }
    );
    setWayPoints(updatedWayPoints);
  };

  const clearRouteHandler = () => {
    setRemainingWayPoints([]);
    setWayPoints([]);
    setUserCoordsArray([]);
    setShowRoute(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="black" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => calculateBestRoute()}
          >
            <Text style={styles.buttonText}>Set Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => clearRouteHandler()}
          >
            <Text style={styles.buttonText}>Clear Route</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => toggleLiveTrackingHandler()}
          >
            <Text style={styles.buttonText}>
              {liveTracking ? 'Tracking Off' : 'Tracking On'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        showsMyLocationButton={true}
        showsUserLocation={true}
        onPress={(e) => {
          if (!showRoute) {
            addNewWaypointHandler(e);
          }
        }}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        // provider={PROVIDER_GOOGLE}
      >
        {remainingWayPoints.map((wayPoint) => {
          return (
            <Marker
              key={wayPoint.id}
              coordinate={{
                latitude: wayPoint.latitude,
                longitude: wayPoint.longitude,
              }}
            />
          );
        })}
        {liveTracking && (
          <Polyline
            coordinates={userCoordsArray}
            strokeWidth={9}
            strokeColor="blue"
            geodesic={true}
            zIndex={10}
          />
        )}
        {showRoute && remainingWayPoints.length > 0 && (
          <MapViewDirections
            mode="DRIVING"
            precision="high"
            waypoints={remainingWayPoints}
            optimizeWaypoints={true}
            origin={startLocation}
            destination={wayPoints[wayPoints.length - 1]}
            apikey={keys.googleMapApiKey}
            geodesic={true}
            strokeWidth={3}
            strokeColor="hotpink"
            zIndex={-5}
          />
        )}
      </MapView>
      <TrackingList
        currentPos={
          userCoordsArray[userCoordsArray.length - 1] || startLocation
        }
        wayPoints={wayPoints}
        remainingWayPoints={remainingWayPoints}
        completedWayPointHandler={completedWayPointHandler}
        markAsCompletedHandler={markAsCompletedHandler}
        clearRouteHandler={clearRouteHandler}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  buttonsContainer: {
    height: 25,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    textAlign: 'center',
  },
  button: {
    width: '30%',
    backgroundColor: '#2DBF64',
    padding: 2,
    marginHorizontal: 2,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '300',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});

export default MapScreen;

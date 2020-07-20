import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import haversine from 'haversine';
import { AntDesign } from '@expo/vector-icons';
import TrackingItem from './TrackingItem';

const TrackingList = (props) => {
  const {
    wayPoints,
    remainingWayPoints,
    completedWayPointHandler,
    markAsCompletedHandler,
    clearRouteHandler,
    currentPos,
  } = props;
  const [wayPointCloseBy, setWayPointCloseBy] = useState(null);
  const [wayPointsToShow, setWayPointsToShow] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [routeFinished, setRouteFinished] = useState(false);

  useEffect(() => {
    const formattedWayPoints = wayPoints.map((wayPoint) => {
      const wayPointCoords = {
        latitude: wayPoint.latitude,
        longitude: wayPoint.longitude,
      };
      const distanceBetweenWayPointAndUser = haversine(
        currentPos,
        wayPointCoords,
        { unit: 'meter' }
      );
      if (distanceBetweenWayPointAndUser < 100 && !wayPoint.completed) {
        setWayPointCloseBy(wayPoint);
        setModalVisible(true);
      }
      return {
        ...wayPoint,
        distanceAway: distanceBetweenWayPointAndUser,
      };
    });
    setWayPointsToShow(formattedWayPoints);

    if (wayPoints.length > 0 && remainingWayPoints.length === 0) {
      setRouteFinished(true);
    } else {
      setRouteFinished(false);
    }
  }, [currentPos, wayPoints]);

  const ItemsPickedUp = () => (
    <View
      style={{
        ...styles.shadedContainer,
        ...styles.itemsPickedUp,
      }}
    >
      <Text style={{ fontWeight: 'bold' }}>ITEMS PICKED UP</Text>
      <AntDesign
        name="checkcircle"
        style={{ paddingVertical: 2 }}
        size={24}
        color="#ff7029"
      />
    </View>
  );

  const ItemsDelivered = () => (
    <>
      <View
        style={{
          ...styles.shadedContainer,
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>ALL ITEMS DELIVERED</Text>
        <AntDesign
          name="checkcircle"
          style={{ paddingVertical: 2 }}
          size={24}
          color="#ff7029"
        />
      </View>
      <View style={styles.journeyCompleteButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            console.log('HANDLE COMPLETED');
            clearRouteHandler();
          }}
          style={{ padding: 20, backgroundColor: '#ff7029' }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '500',
              textTransform: 'uppercase',
            }}
          >
            Report Journey Completed
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Destination Approaching</Text>
            <Text style={styles.modalText}>
              {`Arriving at ${
                wayPointCloseBy && wayPointCloseBy.streetAddress.split(',')[0]
              } now, mark as complete?`}{' '}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: '#2DBF64' }}
                onPress={() => {
                  setModalVisible(false);
                  completedWayPointHandler(wayPointCloseBy);
                  markAsCompletedHandler(wayPointCloseBy);
                  setWayPointCloseBy(null);
                }}
              >
                <Text style={styles.textStyle}>YES</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: '#ff7029' }}
                onPress={() => {
                  setModalVisible(false);
                  setWayPointCloseBy(null);
                }}
              >
                <Text style={styles.textStyle}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ItemsPickedUp />}
          ListFooterComponent={
            wayPoints.length && routeFinished && <ItemsDelivered />
          }
          data={wayPointsToShow}
          renderItem={(itemData) => (
            <TrackingItem
              markAsCompletedHandler={markAsCompletedHandler}
              completedWayPointHandler={completedWayPointHandler}
              itemData={itemData}
            />
          )}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    backgroundColor: '#f7f7f7',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    padding: 15,
  },
  shadedContainer: {
    padding: 10,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#636363',
    shadowOffset: {
      width: 0.5,
      height: 0.5,
    },
    shadowOpacity: 0.1,
  },
  itemsPickedUp: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    padding: 7,
    backgroundColor: '#2DBF64',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyCompleteButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalView: {
    position: 'absolute',
    top: 60,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: '#F194FF',
    width: 100,
    padding: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: 10,
  },
});

export default TrackingList;

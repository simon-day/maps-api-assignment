import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const TrackingItem = ({
  itemData,
  markAsCompletedHandler,
  completedWayPointHandler,
}) => {
  return (
    <View style={styles.shadedContainer}>
      <View style={styles.row}>
        <Text
          style={{
            fontWeight: itemData.item.completed ? '300' : '600',
            color: itemData.item.completed ? '#595959' : 'black',
          }}
        >
          {itemData.item.streetAddress.split(',')[0]}
        </Text>
        {!itemData.item.completed ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              markAsCompletedHandler(itemData.item);
              completedWayPointHandler(itemData.item);
            }}
          >
            <Text style={{ color: 'white' }}>COMPLETE</Text>
          </TouchableOpacity>
        ) : (
          <AntDesign
            name="checkcircle"
            style={{ paddingVertical: 2 }}
            size={24}
            color="#2DBF64"
          />
        )}
      </View>
    </View>
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

export default TrackingItem;

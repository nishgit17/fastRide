import polyline from '@mapbox/polyline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  InteractionManager,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const Riding = () => {
  const {
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    pin,
    durationMin,
    paymentMethod,
    rideType,
    amount,
    eta,
    rideId,
  } = useLocalSearchParams();

  const router = useRouter();
  const [polylineCoords, setPolylineCoords] = useState([]);
  const [enteredPin, setEnteredPin] = useState('');
  const [riderName, setRiderName] = useState('Loading...');

  const pickup = {
    latitude: parseFloat(pickupLat as string),
    longitude: parseFloat(pickupLng as string),
  };

  const drop = {
    latitude: parseFloat(dropLat as string),
    longitude: parseFloat(dropLng as string),
  };

  const generateMockRiderName = () => {
    const names = ['Ritika', 'Anjali', 'Nikita', 'Shruti', 'Neha', 'Kavita', 'Pooja', 'Priya'];
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  };

  const fetchPolyline = async () => {
    try {
      const origin = `${pickup.latitude},${pickup.longitude}`;
      const destination = `${drop.latitude},${drop.longitude}`;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=AIzaSyA-ivHxJO-Kjma_sDi9zvpjxd9nB4jZTXE`
      );
      const data = await res.json();
      if (data.routes?.[0]?.overview_polyline?.points) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        setPolylineCoords(coords);
      }
    } catch (err) {
      console.error('Polyline fetch error:', err);
    }
  };

  useEffect(() => {
    const saveRideInfo = async () => {
      await AsyncStorage.setItem(
        'currentRide',
        JSON.stringify({
          pickupLat,
          pickupLng,
          dropLat,
          dropLng,
          riderName,
          pin,
          durationMin,
          paymentMethod,
          rideType,
          amount,
          eta,
        })
      );
    };

    saveRideInfo();
    fetchPolyline();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; 
    });

    return () => {
      backHandler.remove(); 
    };
  }, []);

  useEffect(() => {
    const fetchRider = async () => {
      if (rideId) {
        try {
          const doc = await firestore().collection('rides').doc(rideId as string).get();
          setRiderName(doc.data()?.riderName || generateMockRiderName());
        } catch (error) {
          console.error('Failed to fetch rider name:', error);
          setRiderName(generateMockRiderName());
        }
      }
    };
    fetchRider();
  }, [rideId]);

  const handleCompleteRide = () => {
    console.log('Entered PIN:', `"${enteredPin}"`);
    console.log('Expected PIN:', `"${pin}"`);
    
    const cleanedEnteredPin = (enteredPin || '').trim();
    const expectedPin = (pin || '').toString().trim();

    if (cleanedEnteredPin.length !== 4 || cleanedEnteredPin !== expectedPin) {
      alert('Incorrect PIN. Please ask the rider for the correct 4-digit PIN.');
      return;
    }
    AsyncStorage.removeItem('currentRide');

    InteractionManager.runAfterInteractions(() => {
      router.push({
        pathname: '/generateqr',
        params: {
          pickupLat,
          pickupLng,
          dropLat,
          dropLng,
          rideType,
          driverName: riderName,
          pin,
          eta,
          amount,
        },
      });
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (pickup.latitude + drop.latitude) / 2,
          longitude: (pickup.longitude + drop.longitude) / 2,
          latitudeDelta: Math.abs(pickup.latitude - drop.latitude) + 0.05,
          longitudeDelta: Math.abs(pickup.longitude - drop.longitude) + 0.05,
        }}
      >
        <Marker coordinate={pickup} pinColor="green" title="Pickup" />
        <Marker coordinate={drop} pinColor="red" title="Drop" />
        {polylineCoords.length > 0 && (
          <Polyline coordinates={polylineCoords} strokeColor="#007AFF" strokeWidth={4} />
        )}
      </MapView>

      <View style={styles.details}>
        <Text style={styles.heading}>Ride Details</Text>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Rider:</Text>
          <Text style={styles.value}>👤 {riderName}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>Enter PIN:</Text>
          <TextInput
            style={styles.pinInput}
            value={enteredPin}
            onChangeText={setEnteredPin}
            keyboardType="numeric"
            maxLength={4}
            placeholder="----"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>ETA:</Text>
          <Text style={styles.value}>
            🚗 {durationMin && !isNaN(Number(durationMin)) ? `${durationMin} min` : 'Calculating...'}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              AsyncStorage.removeItem('currentRide');
              router.replace('/driverprocess');
            }}
          >
            <Text style={styles.cancelText}>Cancel Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={handleCompleteRide}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Riding;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: height * 0.5 },
  details: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  pinInput: {
    width: 80,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFD600',
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#eee',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

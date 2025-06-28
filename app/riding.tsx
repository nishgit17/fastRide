import polyline from '@mapbox/polyline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const riding = () => {
  const { pickupLat, pickupLng, dropLat, dropLng, driverName, pin, durationMin, paymentMethod, rideType, amount, eta } = useLocalSearchParams();
  const router = useRouter();
  const [polylineCoords, setPolylineCoords] = useState([]);

  const pickup = {
    latitude: parseFloat(pickupLat as string),
    longitude: parseFloat(pickupLng as string),
  };

  const drop = {
    latitude: parseFloat(dropLat as string),
    longitude: parseFloat(dropLng as string),
  };

  const generateMockDriverName = () => {
  const names = ['Rajiv', 'Amit', 'Suresh', 'Kiran', 'Deepak', 'Neeraj', 'Manoj', 'Sunil'];
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
    // Save ride info so it persists across app restarts
    const saveRideInfo = async () => {
      await AsyncStorage.setItem('currentRide', JSON.stringify({
        pickupLat, pickupLng, dropLat, dropLng,
        driverName, pin, durationMin, paymentMethod,
        rideType, amount, eta,
      }));
    };

    saveRideInfo();
    fetchPolyline();

    // Prevent back button from navigating away
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp(); // Exit app directly
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

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
          <Text style={styles.label}>Driver:</Text>
          <Text style={styles.value}>👨‍✈️ {driverName || generateMockDriverName()}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>PIN:</Text>
          <Text style={styles.pin}>{pin || '----'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.label}>ETA:</Text>
          <Text style={styles.value}>
            🚗 Arriving in {durationMin && !isNaN(Number(durationMin)) ? `${durationMin} min` : 'calculating...'}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => {
            AsyncStorage.removeItem('currentRide');
            router.replace('/drawer/home')}}>
            <Text style={styles.cancelText}>Cancel Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => {
                AsyncStorage.removeItem('currentRide');
                if (paymentMethod === 'Cash') {
                    Alert.alert(
                        'Pay in Cash',
                        `Please pay ₹${amount} to the driver in cash.`,
                        [
                            {
                                text: 'OK',
                                onPress: () => router.replace('/drawer/home'),
                            },
                        ]
                    );
                } else {
                    router.push({
                        pathname: '/upipayment',
                        params: {
                            pickupLat,
                            pickupLng,
                            dropLat,
                            dropLng,
                            rideType,
                            driverName,
                            pin,
                            eta,
                            amount,
                        },
                    });
                }
            }}
          >
  <Text style={styles.doneText}>Done</Text>
</TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

export default riding;

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
  pin: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
    color: '#000',
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


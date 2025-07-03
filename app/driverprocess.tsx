import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const screenHeight = Dimensions.get('window').height;

interface Ride {
  id: string;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  rideType: string;
  amount: number;
  durationMin: number;
  [key: string]: any;
}

const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (place) {
      return `${place.name || ''}, ${place.street || ''}, ${place.city || ''}, ${place.region || ''}`;
    } else {
      return 'Unknown Location';
    }
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return 'Address not available';
  }
};

const DriverProcess = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rideRequests, setRideRequests] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [addresses, setAddresses] = useState<Record<string, { pickup: string; drop: string }>>({});
  const mapRef = useRef<MapView>(null);
  const user = auth().currentUser;
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('rides')
      .where('status', '==', 'pending')
      .onSnapshot(async (snapshot) => {
const rides: Ride[] = snapshot.docs.map((doc) => {
  const data = doc.data();
  const pickup = data.pickup || {};

  console.log('Ride:', doc.id);
  console.log('pickup.price:', pickup.price);
  console.log('parsed amount:', Number(pickup.price));

  return {
    id: doc.id,
    pickupLat: pickup.latitude ?? 0,
    pickupLng: pickup.longitude ?? 0,
    dropLat: data.drop?.latitude ?? 0,
    dropLng: data.drop?.longitude ?? 0,
    rideType: data.rideType || '',
    amount: Number(pickup.price) || 0,
    durationMin: Number(data.durationMin) || 0,
  };
});


        setRideRequests(rides.filter((ride) => ride.id !== selectedRide?.id));

        const newAddresses: Record<string, { pickup: string; drop: string }> = {};
        for (const ride of rides) {
          const pickup = await getAddressFromCoords(ride.pickupLat, ride.pickupLng);
          const drop = await getAddressFromCoords(ride.dropLat, ride.dropLng);
          newAddresses[ride.id] = { pickup, drop };
        }
        setAddresses(newAddresses);
      });

    return () => unsubscribe();
  }, [selectedRide]);

  const acceptRide = async (ride: Ride) => {
    if (!user) return;

    try {
      await firestore().collection('rides').doc(ride.id).update({
        status: 'accepted',
        driverId: user.uid,
        acceptedAt: firestore.FieldValue.serverTimestamp(),
      });
      setSelectedRide(ride);
      Alert.alert('Ride Accepted', 'You have accepted the ride request.');
    } catch (error) {
      console.error('Accept Ride Error:', error);
      Alert.alert('Error', 'Could not accept ride.');
    }
  };

  const rejectRide = async (rideId: string) => {
    try {
      await firestore().collection('rides').doc(rideId).update({
        status: 'rejected',
      });
      Alert.alert('Ride Rejected', 'You have rejected the ride request.');
    } catch (error) {
      console.error('Reject Ride Error:', error);
      Alert.alert('Error', 'Could not reject ride.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton
      >
        {selectedRide && (
          <>
            <Marker
              coordinate={{
                latitude: selectedRide.pickupLat,
                longitude: selectedRide.pickupLng,
              }}
              title="Pickup Location"
              pinColor="green"
            />
            <Marker
              coordinate={{
                latitude: selectedRide.dropLat,
                longitude: selectedRide.dropLng,
              }}
              title="Drop Location"
              pinColor="red"
            />
          </>
        )}
      </MapView>

      <TouchableOpacity
        onPress={() => router.push('/dprofile')}
        style={{
          position: 'absolute',
          top: 50,
          right: 20,
          backgroundColor: '#fff',
          padding: 10,
          borderRadius: 8,
          elevation: 5,
          zIndex: 999,
        }}
      >
        <Text style={{ fontWeight: 'bold', color: '#000' }}>👤 Profile</Text>
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <Text style={styles.heading}>Active Ride Requests</Text>

        {rideRequests.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 10 }}>No pending rides</Text>
        ) : (
          <FlatList
            data={rideRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.rideCard}>
                <Text style={styles.rideText}>
                  From: {addresses[item.id]?.pickup || 'Loading...'}
                </Text>
                <Text style={styles.rideText}>
                  To: {addresses[item.id]?.drop || 'Loading...'}
                </Text>
                <Text style={styles.rideText}>Type: {item.rideType}</Text>
                <Text style={styles.rideText}>
                  ₹{!isNaN(item.amount) ? item.amount : 0} | {item.durationMin} min
                </Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptRide(item)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => rejectRide(item.id)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default DriverProcess;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: screenHeight * 0.5 },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  rideCard: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    marginVertical: 6,
    borderRadius: 8,
  },
  rideText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 8,
    marginLeft: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

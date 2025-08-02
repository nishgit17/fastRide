import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Image2 from '../assets/images/norequests.png';

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
  pin?: string;
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

const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const DriverProcess = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rideRequests, setRideRequests] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [addresses, setAddresses] = useState<Record<string, { pickup: string; drop: string }>>({});
  const [driverName, setDriverName] = useState<string>('Unknown');
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const user = auth().currentUser;

  useEffect(() => {
    const fetchDriverName = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error('No driver is currently logged in');
        return;
      }

      try {
        const driverDoc = await firestore().collection('users').doc(currentUser.uid).get();
        const name = driverDoc.data()?.name || 'Unknown';
        setDriverName(name);
      } catch (error) {
        console.error('Failed to fetch driver name:', error);
      }
    };

    fetchDriverName();
  }, []);

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
    if (!user?.uid) return;
    const unsubscribe = firestore()
      .collection('rides')
      .where('status', '==', 'pending')
      .where('visibleToDrivers', 'array-contains', user.uid)
      .onSnapshot(async (snapshot) => {
        const rides: Ride[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const pickup = data.pickup || {};

          return {
            id: doc.id,
            pickupLat: pickup.latitude ?? 0,
            pickupLng: pickup.longitude ?? 0,
            dropLat: data.drop?.latitude ?? 0,
            dropLng: data.drop?.longitude ?? 0,
            rideType: data.rideType || '',
            amount: typeof data?.price === 'number' ? data.price : 0,
            durationMin: Number(data.durationMin) || 0,
            pin: data.pin || '',
          };
        });

        if (location) {
          const filteredRides = rides.filter((ride) => {
            const distance = getDistanceFromLatLonInKm(
              location.latitude,
              location.longitude,
              ride.pickupLat,
              ride.pickupLng
            );
            return distance <= 3 && ride.id !== selectedRide?.id;
          });

          setRideRequests(filteredRides);

          const newAddresses: Record<string, { pickup: string; drop: string }> = {};
          for (const ride of filteredRides) {
            const pickup = await getAddressFromCoords(ride.pickupLat, ride.pickupLng);
            const drop = await getAddressFromCoords(ride.dropLat, ride.dropLng);
            newAddresses[ride.id] = { pickup, drop };
          }
          setAddresses(newAddresses);
        }
      });

    return () => unsubscribe();
  }, [selectedRide, location]);

  const acceptRide = async (ride: Ride) => {
    if (!user) return;

    try {
      await firestore().collection('rides').doc(ride.id).update({
        status: 'accepted',
        driverId: user.uid,
        driverName,
        acceptedAt: firestore.FieldValue.serverTimestamp(),
      });

      setSelectedRide(ride);

      router.push({
        pathname: '/driding',
        params: {
          rideId: ride.id,
          pickupLat: ride.pickupLat.toString(),
          pickupLng: ride.pickupLng.toString(),
          dropLat: ride.dropLat.toString(),
          dropLng: ride.dropLng.toString(),
          rideType: ride.rideType,
          amount: ride.amount.toString(),
          durationMin: ride.durationMin.toString(),
          pin: ride.pin?.toString() ?? '',
          driverName,
        },
      });
    } catch (error) {
      console.error('Accept Ride Error:', error);
    }
  };

  const rejectRide = async (rideId: string) => {
    try {
      await firestore().collection('rides').doc(rideId).update({
        status: 'rejected',
      });
    } catch (error) {
      console.error('Reject Ride Error:', error);
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
        style={styles.profileButton}
      >
        <Text style={{ fontWeight: 'bold', color: '#000' }}>👤 Profile</Text>
      </TouchableOpacity>

      <View style={styles.requestContainer}>
        <Text style={styles.heading}>Active Ride Requests</Text>

        {rideRequests.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontSize: 16, color: '#888' }}>No pending requests</Text>
            <Image source={Image2} style={styles.image} resizeMode="contain" />
          </View>
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
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  container: { flex: 1 },
  map: { height: screenHeight * 0.5 },
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  requestContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    color: 'black',
  },
  rideCard: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    marginVertical: 6,
    borderRadius: 8,
  },
  rideText: {
    fontSize: 14,
    color: 'black',
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

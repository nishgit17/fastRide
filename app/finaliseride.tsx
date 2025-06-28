import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { JSX } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const GOOGLE_API_KEY = 'AIzaSyA-ivHxJO-Kjma_sDi9zvpjxd9nB4jZTXE';

interface RideOption {
  type: string;
  description: string;
  people: number;
  fastest?: boolean;
  price: number;
  durationMin: number | null;
  icon: JSX.Element;
}

const baseRides: RideOption[] = [
  {
    type: 'Bike',
    description: 'Quick Bike rides',
    people: 1,
    fastest: true,
    price: 0,
    durationMin: null,
    icon: <MaterialCommunityIcons name="motorbike" size={28} color="black" />,
  },
  {
    type: 'Cab Non AC',
    description: '',
    people: 4,
    price: 0,
    durationMin: null,
    icon: <FontAwesome5 name="car" size={28} color="black" />,
  },
  {
    type: 'Cab AC',
    description: '',
    people: 4,
    price: 0,
    durationMin: null,
    icon: (
      <View style={{ position: 'relative' }}>
        <FontAwesome5 name="car" size={28} color="#007AFF" />
        <MaterialCommunityIcons
          name="snowflake"
          size={14}
          color="#007AFF"
          style={{ position: 'absolute', right: -4, bottom: -4 }}
        />
      </View>
    ),
  },
];

const FinaliseRide = () => {
  const [polylineCoords, setPolylineCoords] = useState([]);
  const { pickupLat, pickupLng, dropLat, dropLng } = useLocalSearchParams();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const defaultCoords = { latitude: 22.5726, longitude: 88.3639 };

  const pickup = {
    latitude: parseFloat(pickupLat as string) || defaultCoords.latitude,
    longitude: parseFloat(pickupLng as string) || defaultCoords.longitude,
  };

  const pin = Math.floor(1000 + Math.random() * 9000).toString();

  const drop = {
    latitude: parseFloat(dropLat as string) || defaultCoords.latitude + 0.01,
    longitude: parseFloat(dropLng as string) || defaultCoords.longitude + 0.01,
  };

  const [availableRides, setAvailableRides] = useState<RideOption[]>(baseRides);
  const [selectedRide, setSelectedRide] = useState<RideOption>(baseRides[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const recenterMap = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: (pickup.latitude + drop.latitude) / 2,
        longitude: (pickup.longitude + drop.longitude) / 2,
        latitudeDelta: Math.abs(pickup.latitude - drop.latitude) + 0.05,
        longitudeDelta: Math.abs(pickup.longitude - drop.longitude) + 0.05,
      }, 800);
    }
  };

  const fetchDistance = async () => {
    try {
      const origin = `${pickup.latitude},${pickup.longitude}`;
      const destination = `${drop.latitude},${drop.longitude}`;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`
      );
      const data = await res.json();

      if (data.routes?.[0]?.legs?.[0]) {
        const leg = data.routes[0].legs[0];
        const distanceInKm = leg.distance.value / 1000;
        const durationSec = leg.duration.value;

        // Decode polyline
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setPolylineCoords(coords);

        if (distanceInKm === 0 || isNaN(distanceInKm)) {
          updateRidePrices(2, 300);
        } else {
          updateRidePrices(distanceInKm, durationSec);
        }
      }
    } catch (error) {
      console.error('Failed to fetch distance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRidePrices = (distanceKm: number, durationSec: number) => {
    const updated = baseRides.map((ride) => {
      const price = ride.type === 'Bike' ? 30 + distanceKm * 8
        : ride.type === 'Cab Non AC' ? 50 + distanceKm * 12
        : 60 + distanceKm * 15;
      const multiplier = ride.type === 'Bike' ? 0.5 : ride.type === 'Cab AC' ? 1 : 1.2;
      const durationMin = Math.ceil((durationSec * multiplier) / 60);
      return { ...ride, price: Math.round(price), durationMin };
    });
    setAvailableRides(updated);
    setSelectedRide(updated[0]);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/drawer/home');
      return true;
    });
    fetchDistance();
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        mapType="standard"
        initialRegion={{
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={pickup} title="Pickup Location" pinColor="green" />
        <Marker coordinate={drop} title="Drop Location" pinColor="red" />
        {polylineCoords.length > 0 && (
          <Polyline coordinates={polylineCoords} strokeColor="#007AFF" strokeWidth={3} />
        )}

      </MapView>

      <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
        <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={availableRides}
            keyExtractor={(item) => item.type}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedRide(item)} style={styles.rideOption}>
                <View style={styles.left}>{item.icon}</View>
                <View style={styles.center}>
                  <Text style={styles.rideType}>{item.type}</Text>
                  {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
                </View>
                <View style={styles.right}>
                  {item.fastest && <Text style={styles.fastest}>FASTEST</Text>}
                  <Text style={styles.price}>₹{item.price}</Text>
                  <Text style={styles.duration}>{item.durationMin ? `${item.durationMin} min` : '...'}</Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.rideList}
          />
        )}

        <View style={styles.footer}>
          <View style={styles.optionsRow}>
            <TouchableOpacity onPress={() => setShowPaymentOptions(!showPaymentOptions)}>
              <View style={styles.paymentSelector}>
                <Text style={styles.option}>{paymentMethod === 'Cash' ? '💵 Cash' : '📱 UPI'}</Text>
                <MaterialCommunityIcons
                  name={showPaymentOptions ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#000"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </TouchableOpacity>
            {showPaymentOptions && (
              <View style={styles.paymentOptions}>
                <TouchableOpacity onPress={() => { setPaymentMethod('Cash'); setShowPaymentOptions(false); }}>
                  <Text style={styles.paymentOptionItem}>💵 Cash</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setPaymentMethod('UPI'); setShowPaymentOptions(false); }}>
                  <Text style={styles.paymentOptionItem}>📱 UPI</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => {
              const pin = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit pin
              router.push({
                pathname: '/riding',
                params: {
                  pickupLat: pickup.latitude.toString(),
                  pickupLng: pickup.longitude.toString(),
                  dropLat: drop.latitude.toString(),
                  dropLng: drop.longitude.toString(),
                  rideType: selectedRide.type,
                  pin,
                  durationMin: selectedRide.durationMin?.toString() || '0',
                  paymentMethod,
                  amount: selectedRide.price.toString(),
                },
              });
            }}
          >
            <Text style={styles.bookText}>Book {selectedRide.type}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FinaliseRide;

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  recenterButton: {
    position: 'absolute', top: 20, right: 20,
    backgroundColor: '#fff', padding: 10, borderRadius: 8,
    elevation: 4, zIndex: 100,
  },
  bottomSheet: {
    height: screenHeight * 0.45,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    overflow: 'hidden', elevation: 8,
    paddingHorizontal: 16,
  },
  rideList: {
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    flexGrow: 0,
  },
  rideOption: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomColor: '#ddd', borderBottomWidth: 1,
    alignItems: 'center',
  },
  left: { width: 40 },
  center: { flex: 1, paddingHorizontal: 10 },
  rideType: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  description: { color: '#555', fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  fastest: {
    backgroundColor: '#e0f7fa', color: '#007AFF', fontSize: 10,
    paddingHorizontal: 6, borderRadius: 4, marginBottom: 4,
  },
  price: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  duration: { fontSize: 12, color: '#555' },
  footer: {
    paddingTop: 12, borderTopWidth: 1, borderColor: '#ddd',
  },
  optionsRow: {
    marginBottom: 12,
  },
  paymentSelector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8,
    justifyContent: 'space-between',
  },
  option: { color: '#000', fontSize: 14 },
  paymentOptions: {
    marginTop: 6, backgroundColor: '#f9f9f9', borderRadius: 8,
    padding: 10, elevation: 2,
  },
  paymentOptionItem: { fontSize: 14, paddingVertical: 8, color: '#000' },
  bookButton: {
    backgroundColor: '#FFD600', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center', marginTop: 16,
  },
  bookText: { fontWeight: 'bold', fontSize: 18, color: '#000' },
});

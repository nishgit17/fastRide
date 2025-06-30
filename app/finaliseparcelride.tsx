import { MaterialCommunityIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { JSX } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
    BackHandler,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const GOOGLE_API_KEY = 'AIzaSyA-ivHxJO-Kjma_sDi9zvpjxd9nB4jZTXE';

interface RideOption {
  type: string;
  description: string;
  price: number;
  durationMin: number | null;
  icon: JSX.Element;
}

const baseRides: RideOption[] = [
  {
    type: 'Parcel',
    description: 'Send up to 7kgs',
    price: 0,
    durationMin: null,
    icon: <MaterialCommunityIcons name="package-variant-closed" size={28} color="orange" />,
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

  const drop = {
    latitude: parseFloat(dropLat as string) || defaultCoords.latitude + 0.01,
    longitude: parseFloat(dropLng as string) || defaultCoords.longitude + 0.01,
  };

  const [availableRides, setAvailableRides] = useState<RideOption[]>(baseRides);
  const [selectedRide, setSelectedRide] = useState<RideOption>(baseRides[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [deliveryMode, setDeliveryMode] = useState<'Pickup' | 'Delivery'>('Pickup');

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

        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
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
      const price = 30 + distanceKm * 8;
      const multiplier = 0.5;
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

      <View style={styles.bottomSheetCustom}>
        <View style={styles.rideInfoRow}>
          <View style={styles.rideInfoLeft}>
            <MaterialCommunityIcons name="package-variant-closed" size={28} color="orange" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.rideType}>Parcel</Text>
              <Text style={styles.description}>Send up to 5kgs</Text>
            </View>
          </View>
          <Text style={styles.priceText}>₹{selectedRide.price}</Text>
        </View>

        <View style={styles.metaRow}>
          <Picker
            selectedValue={paymentMethod}
            style={{ height: 40, width: 120 }}
            onValueChange={(itemValue) => setPaymentMethod(itemValue)}
          >
            <Picker.Item label="Cash" value="Cash" />
            <Picker.Item label="UPI" value="UPI" />
          </Picker>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={deliveryMode === 'Pickup' ? styles.activeToggle : styles.inactiveToggle}
              onPress={() => setDeliveryMode('Pickup')}
            >
              <Text style={deliveryMode === 'Pickup' ? styles.toggleText : styles.toggleTextInactive}>Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={deliveryMode === 'Delivery' ? styles.activeToggle : styles.inactiveToggle}
              onPress={() => setDeliveryMode('Delivery')}
            >
              <Text style={deliveryMode === 'Delivery' ? styles.toggleText : styles.toggleTextInactive}>Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookParcelButton}
          onPress={() => {
            const pin = Math.floor(1000 + Math.random() * 9000).toString();
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
          <Text style={styles.bookParcelText}>Book Parcel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FinaliseRide;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  recenterButton: {
    position: 'absolute', top: 20, right: 20,
    backgroundColor: '#fff', padding: 10, borderRadius: 8,
    elevation: 4, zIndex: 100,
  },
bottomSheetCustom: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff', // Light mode fix
  padding: 16,
  paddingBottom: 60, // Add extra space at bottom
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  elevation: 8,
},

  rideInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  rideInfoLeft: {
    flexDirection: 'row', alignItems: 'center',
  },
  rideType: { fontSize: 16, color: '#000', fontWeight: '600' },
  description: { fontSize: 12, color: '#555' },
  priceText: { fontSize: 16, color: '#000', fontWeight: '700' },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10,
  },
  toggleRow: {
    flexDirection: 'row', backgroundColor: '#eee', borderRadius: 20, overflow: 'hidden',
  },
  activeToggle: {
    backgroundColor: '#007bff', paddingVertical: 6, paddingHorizontal: 14,
    borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
  },
  inactiveToggle: {
    paddingVertical: 6, paddingHorizontal: 14,
  },
  toggleText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  toggleTextInactive: { color: '#333', fontSize: 12 },
  bookParcelButton: {
    backgroundColor: '#FFD600', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center', marginTop: 18,
  },
  bookParcelText: { fontWeight: 'bold', fontSize: 18, color: '#000' },
});

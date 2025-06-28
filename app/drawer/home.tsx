import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import Image2 from '../../assets/images/goRapido.png';
import Image3 from '../../assets/images/rapidooffer.png';

const DEFAULT_COORD = { latitude: 22.5726, longitude: 88.3639 };
const DEFAULT_DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };

const Home = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const params = useLocalSearchParams();

  const [markerCoord, setMarkerCoord] = useState(DEFAULT_COORD);
  const [region, setRegion] = useState<Region>({ ...DEFAULT_COORD, ...DEFAULT_DELTA });
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(true);

  // Ask permission & get current position
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync();
          const { latitude, longitude } = loc.coords;
          const initCoord = { latitude, longitude };
          setMarkerCoord(initCoord);
          const initRegion = { ...initCoord, ...DEFAULT_DELTA };
          setRegion(initRegion);
          setSelectedAddress('Current Location');
          mapRef.current?.animateToRegion(initRegion, 300);
        }
      } catch (error) {
        console.error("Location error:", error);
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, []);

  // Back-button behavior
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);


  // Handle coming back with params
  useEffect(() => {
    if (!params) return;
    
    try {
      const { lat, lng, address } = params as any;
      if (lat && lng) {
        const parsedLat = parseFloat(lat as string);
        const parsedLng = parseFloat(lng as string);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          const coord = { latitude: parsedLat, longitude: parsedLng };
          setMarkerCoord(coord);
          const newReg = { ...coord, ...DEFAULT_DELTA };
          setRegion(newReg);
          setSelectedAddress(address ? decodeURIComponent(address as string) : '');
          mapRef.current?.animateToRegion(newReg, 300);
        }
      }
    } catch (error) {
      console.error("Params handling error:", error);
    }
  }, [params]);

  // Ensure map recenters on returning to screen
  useFocusEffect(
    useCallback(() => {
      if (mapRef.current && !params?.lat && !params?.lng) {
        mapRef.current.animateToRegion(region, 300);
      }
    }, [region, params])
  );

  const handleMapPress = async (e: any) => {
    try {
      const coord = e.nativeEvent.coordinate;
      const newReg = { ...coord, ...DEFAULT_DELTA };
      setMarkerCoord(coord);
      setRegion(newReg);
      mapRef.current?.animateToRegion(newReg, 300);

      const res = await Location.reverseGeocodeAsync(coord);
      const addr: Partial<Location.LocationGeocodedAddress> =
        res && res.length > 0 ? res[0] : {};

      const parts = [addr.name, addr.street, addr.city].filter(Boolean);
      setSelectedAddress(parts.join(', '));
    } catch (err) {
      console.error('Reverse geocode failed:', err);
      setSelectedAddress('Unknown location');
    }
  };

  const handleNavigateToSelectLocation = () => {
    const encoded = encodeURIComponent(selectedAddress || '');
    router.push({
      pathname: '/selectlocation',
      params: {
        address: encoded,
        ...(markerCoord && {
          lat: markerCoord.latitude.toString(),
          lng: markerCoord.longitude.toString()
        })
      },
    });
  };

  if (loadingLoc) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 400, borderRadius: 15, overflow: 'hidden' }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1, backgroundColor: "green"}}
          provider={PROVIDER_GOOGLE}
          region={region}
          showsUserLocation
          showsMyLocationButton
          onPress={handleMapPress}
        >
          <Marker
            coordinate={markerCoord}
            title="Selected Location"
            description="Tap to select this point"
            onCalloutPress={handleNavigateToSelectLocation}
          />
        </MapView>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <View style={styles.menuButton}>
            <MaterialCommunityIcons name="menu" size={24} color="black"/>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={handleNavigateToSelectLocation} 
          activeOpacity={0.9}
        >
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchInputText}>{selectedAddress || 'Search destination'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.servicesRow}>
          <TouchableOpacity style={styles.serviceButton} onPress={() => router.push('/parcel')}>
            <MaterialCommunityIcons name="package-variant-closed" size={28} color="brown"/>
            <Text style={styles.serviceText}>Parcel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceButton} 
            onPress={handleNavigateToSelectLocation}
          >
            <Ionicons name="car" size={28} color="black"/>
            <Text style={styles.serviceText}>Cab</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceButton} 
            onPress={handleNavigateToSelectLocation}
          >
            <Ionicons name="bicycle" size={28} color="red"/>
            <Text style={styles.serviceText}>Bike</Text>
          </TouchableOpacity>
        </View>

        <Image source={Image3} style={styles.promoImage} resizeMode="contain"/>
        <Image source={Image2} style={styles.bottomImage} resizeMode="cover"/>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginTop: 20,
    marginBottom: 30
  },
  menuButton: {
    marginRight: 10,
    padding: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 10
  },
  searchInputWrapper: {
    flex: 1,
    height: 50,
    justifyContent: 'center'
  },
  searchInputText: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 4
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32
  },
  serviceButton: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  serviceText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500'
  },
  promoImage: {
    width: '100%',
    height: 180,
    marginBottom: 30
  },
  bottomImage: {
    width: '100%',
    height: 300,
    borderRadius: 16
  },
});

export default Home;
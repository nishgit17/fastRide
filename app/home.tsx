import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  BackHandler, Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import Image2 from '../assets/images/goRapido.png';
import Image3 from '../assets/images/rapidooffer.png';

const Home = () => {
  const [mapKey, setMapKey] = useState(0);
  const [searchText, setSearchText] = useState('');
  const { lat, lng } = useLocalSearchParams();
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [markerCoord, setMarkerCoord] = useState({
  latitude: 22.5726,
  longitude: 88.3639,
  });
  const INITIAL_REGION ={
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  };

  useEffect(() => {
    (async () => {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if(status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
    })();
  }, []);

useFocusEffect(
  React.useCallback(() => {
    console.log('Map screen focused');

    // Reset marker if needed
    setMarkerCoord({
      latitude: 22.5726,
      longitude: 88.3639,
    });

    // Delay mapKey update slightly to allow state to stabilize
    const timeout = setTimeout(() => {
      setMapKey(prev => prev + 1);
    }, 100);

    return () => clearTimeout(timeout);
  }, [])
);



  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove(); 
  }, [])
);

return (

    <ScrollView contentContainerStyle={{ paddingTop: 300, paddingHorizontal: 20, paddingBottom: 100 }}>

        <Text style={styles.sectionTitle}>Interactive Map</Text>
        <View style={{ height: 400, borderRadius: 15, overflow: 'hidden' }}>
{markerCoord && markerCoord.latitude && markerCoord.longitude ? (
  <MapView
    key={mapKey}
    style={{ flex: 1 }}
    provider={PROVIDER_GOOGLE}
    initialRegion={INITIAL_REGION}
    showsUserLocation
    showsMyLocationButton
    onPress={async (e) => {
      const coord = e.nativeEvent.coordinate;
      console.log("Tapped coordinates", coord);
      setMarkerCoord(coord);

      try {
        const [address] = await Location.reverseGeocodeAsync(coord);
        const parts = [address?.name, address?.street, address?.city].filter(Boolean);
        const fullAddress = parts.join(', ');
        setSelectedAddress(fullAddress);
      } catch (error) {
        console.error("Failed to fetch address", error);
      }
    }}
  >
    <Marker
      coordinate={markerCoord}
      title="Selected Location"
      description="Tap here to continue"
      onCalloutPress={() => {
        const encodedAddress = encodeURIComponent(selectedAddress || '');
        router.push(
          `/selectlocation?lat=${markerCoord.latitude}&lng=${markerCoord.longitude}&address=${encodedAddress}`
        );
      }}
    />
  </MapView>
) : (
  <Text>Loading map...</Text>
)}

        </View>

      {/* Search bar + menu */}
<View style={styles.searchContainer}>
  <Link href="/homemenu" asChild>
    <TouchableOpacity>
      <View style={styles.menuButton}>
        <MaterialCommunityIcons name="menu" size={24} color="black" />
      </View>
    </TouchableOpacity>
  </Link>

  <TouchableOpacity
    style={{ flex: 1 }}
    onPress={() => router.push("/selectlocation")}
    activeOpacity={0.9}
  >
    <View style={styles.searchInputWrapper}>
      <Text style={styles.searchInputText}>
        {searchText || 'Search destination'}
      </Text>
    </View>
  </TouchableOpacity>
</View>



      {/* Explore section */}
      <Text style={styles.sectionTitle}>Explore</Text>

      {/* Services row */}
      <View style={styles.servicesRow}>
        <Link href="/parcel" asChild>
          <TouchableOpacity style={styles.serviceButton}>
            <MaterialCommunityIcons name="package-variant-closed" size={28} color="brown" />
            <Text style={styles.serviceText}>Parcel</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/selectlocation" asChild>
          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="car" size={28} color="black" />
            <Text style={styles.serviceText}>Cab</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/selectlocation" asChild>
          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="bicycle" size={28} color="red" />
            <Text style={styles.serviceText}>Bike</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Promo and bottom images */}
      <Image source={Image3} style={styles.promoImage} resizeMode="contain" />
      <Image source={Image2} style={styles.bottomImage} resizeMode="cover" />
    </ScrollView>

);
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.9)', 
  },  

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 30,
    marginTop: 20,
  },
  menuButton: {
    marginRight: 10,
    padding: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  serviceButton: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  serviceText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  promoImage: {
    width: '100%',
    height: 180,
    marginBottom: 30,
  },
  bottomImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  searchInputWrapper: {
  flex: 1,
  height: 50,
  justifyContent: 'center',
},

searchInputText: {
  fontSize: 16,
  color: '#000',
  paddingHorizontal: 4,
},

});
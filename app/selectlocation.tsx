import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-get-random-values';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

const GOOGLE_API_KEY = 'AIzaSyA-ivHxJO-Kjma_sDi9zvpjxd9nB4jZTXE'; 
const SelectLocation = () => {
  const params = useLocalSearchParams();
  const address = typeof params?.address === 'string' ? decodeURIComponent(params.address) : '';
  console.log('Received address param:', address);

  const [drop, setDrop] = useState('');

  const pickupRef = useRef<GooglePlacesAutocompleteRef>(null);
  const dropRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    if (pickupRef.current && address) {
      pickupRef.current.setAddressText(address);
    }
  }, [address]);

  return (
    <View style={styles.container}>
      {/* Pickup */}
      <View style={styles.locationContainer}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: 'green' }]} />
          <Text style={[styles.label, { color: 'green' }]}>Pickup</Text>
        </View>
        <GooglePlacesAutocomplete
          ref={pickupRef}
          placeholder="Your Current Location"
          fetchDetails
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              const { lat, lng } = details.geometry.location;
              console.log('Pickup coords:', lat, lng);
            } else {
              console.warn('No location details found');
            }
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
          }}
          predefinedPlaces={[]}
          styles={{
            textInput: styles.input,
            container: { flex: 0 },
          }}
          textInputProps={{
            defaultValue: address,
            onFocus: () => {},
          }}
        />

      </View>

      {/* Drop */}
      <View style={styles.locationContainer}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: 'red' }]} />
          <Text style={[styles.label, { color: 'red' }]}>Drop</Text>
        </View>
        <GooglePlacesAutocomplete
          ref={dropRef}
          placeholder="Search Drop Location"
          fetchDetails
          onPress={(data, details = null) => {
            if (details && details.geometry && details.geometry.location) {
              const { lat, lng } = details.geometry.location;
              console.log('Drop coords:', lat, lng);
            } else {
              console.warn('No location details found');
            }
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
          }}
          predefinedPlaces={[]}
          styles={{
            textInput: styles.input,
            container: { flex: 0 },
          }}
          textInputProps={{
            defaultValue: '',
            onFocus: () => {},
          }}
        />
      </View>

      <Text style={styles.sectionTitle}>Drop Suggestions</Text>
    </View>
  );
};

export default SelectLocation;



const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  locationContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 6,
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 0,
    marginTop: 16,
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';

const GOOGLE_API_KEY = 'AIzaSyA-ivHxJO-Kjma_sDi9zvpjxd9nB4jZTXE';

const SelectLocation = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const address =
    typeof params?.address === 'string' ? decodeURIComponent(params.address) : '';
  console.log('Received address param:', address);

  const pickupRef = useRef<GooglePlacesAutocompleteRef>(null);
  const dropRef = useRef<GooglePlacesAutocompleteRef>(null);

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (pickupRef.current && address) {
      pickupRef.current.setAddressText(address);
    }
  }, [address]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoiding}
    >
      <View style={styles.container}>
        <View style={{zIndex: 20}}>
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
                setPickupCoords({ lat, lng });
              } else {
                console.warn('No location details found');
                setPickupCoords(null);
              }
            }}
            onFail={(error) => console.warn('Autocomplete error:', error)}
            query={{
              key: GOOGLE_API_KEY,
              language: 'en',
            }}
            enablePoweredByContainer={false}
            keyboardShouldPersistTaps="handled"
            predefinedPlaces={[]}
            styles={{
              textInput: styles.input,
              container: styles.autocompleteContainer,
              listView: styles.listView,
            }}
            textInputProps={{
              defaultValue: address,
            }}
          />
        </View>
        </View>

        {/* Drop */}
        <View style={{zIndex: 10}}>
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
              if (details?.geometry?.location) {
                const { lat, lng } = details.geometry.location;
                console.log('Drop coords:', lat, lng);
                setDropCoords({ lat, lng });
              } else {
                console.warn('No location details found');
                setDropCoords(null);
              }
            }}
            onFail={(error) => console.warn('Autocomplete error:', error)}
            query={{
              key: GOOGLE_API_KEY,
              language: 'en',
            }}
            enablePoweredByContainer={false}
            keyboardShouldPersistTaps="handled"
            predefinedPlaces={[]}
            styles={{
              textInput: styles.input,
              container: styles.autocompleteContainer,
              listView: styles.listView,
            }}
            textInputProps={{
              defaultValue: '',
            }}
          />
        </View>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !(pickupCoords && dropCoords) && styles.disabledButton,
          ]}
          disabled={!(pickupCoords && dropCoords)}
          onPress={() => {
            router.push({
              pathname: '/finaliseride',
              params: {
                pickupLat: pickupCoords!.lat.toString(),
                pickupLng: pickupCoords!.lng.toString(),
                dropLat: dropCoords!.lat.toString(),
                dropLng: dropCoords!.lng.toString(),
              },
            });
          }}
        >
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Drop Suggestions</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SelectLocation;

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  locationContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 6,
    marginBottom: 20,
    zIndex: 0,
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
  autocompleteContainer: {
    flex: 0,
    zIndex: 10, // high enough to appear above other views
  },

listView: {
  backgroundColor: '#fff',
  elevation: 3,
  borderRadius: 6,
  zIndex: 20,
  position: 'absolute',   // ← fix this line
  top: 50,                // ← add if needed (adjust based on layout)
},


  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 0,
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#FFF9C4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  confirmText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

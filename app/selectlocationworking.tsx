import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_API_KEY = 'AIzaSyA-ivHxJO-Kjma_sDi9zvpjxd9nB4jZTXE'; 

const SelectLocationWorking = () => {
  const router = useRouter();
  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleConfirm = () => {
    if (!pickupCoords || !dropCoords) return;

    router.push({
      pathname: '/finaliseride',
      params: {
        pickupLat: pickupCoords.lat.toString(),
        pickupLng: pickupCoords.lng.toString(),
        dropLat: dropCoords.lat.toString(),
        dropLng: dropCoords.lng.toString(),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={[styles.inputBlock, { zIndex: 2 }]}>
            <Text style={styles.label}>Pickup Location</Text>
            <GooglePlacesAutocomplete
              ref={pickupRef}
              placeholder="Enter pickup location"
              fetchDetails={true}
              onPress={(data, details = null) => {
                const location = details?.geometry?.location;
                if (location) {
                  setPickupCoords({ lat: location.lat, lng: location.lng });
                }
              }}
              query={{
                key: GOOGLE_API_KEY,
                language: 'en',
                components: 'country:in',
              }}
              styles={{
                textInput: styles.input,
                listView: styles.listView,
                container: styles.autoContainer,
              }}
              textInputProps={{
                placeholderTextColor: '#888',
              }}
            />
          </View>
          <View style={[styles.inputBlock, { zIndex: 1 }]}>
            <Text style={styles.label}>Drop Location</Text>
            <GooglePlacesAutocomplete
              ref={dropRef}
              placeholder="Enter drop location"
              fetchDetails={true}
              onPress={(data, details = null) => {
                const location = details?.geometry?.location;
                if (location) {
                  setDropCoords({ lat: location.lat, lng: location.lng });
                }
              }}
              query={{
                key: GOOGLE_API_KEY,
                language: 'en',
                components: 'country:in',
              }}
              styles={{
                textInput: styles.input,
                listView: styles.listView,
                container: styles.autoContainer,
              }}
              textInputProps={{
                placeholderTextColor: '#888',
              }}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !(pickupCoords && dropCoords) && styles.disabledButton,
            ]}
            disabled={!(pickupCoords && dropCoords)}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  inputBlock: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  autoContainer: {
    flex: 0,
  },
  listView: {
    backgroundColor: '#fff',
    elevation: 5,
    zIndex: 9999,
    position: 'absolute',
    top: 48,
  },
  confirmButton: {
    backgroundColor: '#FFD54F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SelectLocationWorking;

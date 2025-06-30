import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const GOOGLE_API_KEY = 'AIzaSyA-ivHxJO-Kjma_sDi9zvpjxd9nB4jZTXE';

const fetchCoordinatesFromAddress = async (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.warn('Geocoding failed:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const SelectLocation = () => {
  const router = useRouter();

  const [pickupText, setPickupText] = useState('');
  const [dropText, setDropText] = useState('');

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
  const backAction = () => {
    BackHandler.exitApp();
    return true;
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  return () => backHandler.remove();
}, []);

  const handlePickupBlur = async () => {
    const coords = await fetchCoordinatesFromAddress(pickupText);
    setPickupCoords(coords);
  };

  const handleDropBlur = async () => {
    const coords = await fetchCoordinatesFromAddress(dropText);
    setDropCoords(coords);
  };

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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Pickup Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: 'green' }]}>Pickup Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pickup address"
              value={pickupText}
              onChangeText={setPickupText}
              onBlur={handlePickupBlur}
              placeholderTextColor="#888"
            />
          </View>

          {/* Drop Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: 'red' }]}>Drop Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter drop address"
              value={dropText}
              onChangeText={setDropText}
              onBlur={handleDropBlur}
              placeholderTextColor="#888"
            />
          </View>

          {/* Confirm Button */}
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  inputWrapper: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: '#FFF176',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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

export default SelectLocation;

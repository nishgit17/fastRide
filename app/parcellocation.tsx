import { Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

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
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

const features = [
  {
    title: 'We don’t purchase',
    subtitle: 'Our captains won’t pay and buy items on your behalf',
  },
  {
    title: 'Watch the Weight',
    subtitle: 'Maximum allowed weight per order is 7kg',
  },
  {
    title: 'Cash Payment available',
    subtitle: 'Cash payment is available at both pickup or drop locations',
  },
];

const packageTypes = ['Food', 'Medicine', 'Grocery', 'Documents', 'Electronics', 'Clothes', 'Others'];

export default function ParcelLocation() {
  const router = useRouter();
  const [pickupText, setPickupText] = useState('');
  const [dropText, setDropText] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState('Medicine');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handlePickupBlur = async () => {
    const coords = await fetchCoordinatesFromAddress(pickupText);
    setPickupCoords(coords);
  };

  const handleDropBlur = async () => {
    const coords = await fetchCoordinatesFromAddress(dropText);
    setDropCoords(coords);
  };

  const handleContinue = () => {
    if (pickupCoords && dropCoords) {
      router.push({
        pathname: '/finaliseparcelride',
        params: {
          pickupLat: pickupCoords.lat.toString(),
          pickupLng: pickupCoords.lng.toString(),
          dropLat: dropCoords.lat.toString(),
          dropLng: dropCoords.lng.toString(),
          packageType: selectedPackage,
        },
      });
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const selectPackage = (type: string) => {
    setSelectedPackage(type);
    setDropdownVisible(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            style={{ marginBottom: 20 }}
          >
            {features.map((feature, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{feature.title}</Text>
                  <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: 'green' }]}>PICKUP LOCATION</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter pickup address"
              value={pickupText}
              onChangeText={setPickupText}
              onBlur={handlePickupBlur}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: 'red' }]}>DELIVERY LOCATION</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter delivery address"
              value={dropText}
              onChangeText={setDropText}
              onBlur={handleDropBlur}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>PACKAGE TYPE</Text>
            <TouchableOpacity style={styles.dropdown} onPress={toggleDropdown}>
              <Text style={styles.dropdownText}>{selectedPackage}</Text>
              <Entypo name={dropdownVisible ? 'chevron-up' : 'chevron-down'} size={18} color="gray" />
            </TouchableOpacity>
            {dropdownVisible && (
              <View style={styles.dropdownList}>
                {packageTypes.map((type) => (
                  <TouchableOpacity key={type} onPress={() => selectPackage(type)} style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our <Text style={styles.link}>T&C</Text> and there are no{' '}
            <Text style={styles.link}>restricted items</Text> in the package.
          </Text>

          <TouchableOpacity
            style={[styles.button, !(pickupCoords && dropCoords) && styles.disabledButton]}
            disabled={!(pickupCoords && dropCoords)}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 4,
  },
  card: {
    width: screenWidth * 0.85,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 100,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  inputField: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    fontSize: 15,
    color: '#000',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
  },
  dropdownList: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginTop: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
  },
  terms: {
    fontSize: 12,
    color: '#444',
    marginBottom: 20,
    marginTop: 160,
  },
  link: {
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#FFD600',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
});

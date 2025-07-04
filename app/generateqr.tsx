import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const UpiPayment = () => {
  const {
    amount,
    driverName,
  } = useLocalSearchParams();

  const router = useRouter();

  const upiId = 'rider@upi'; // Replace with dynamic or fetched value if needed
  const upiUrl = `upi://pay?pa=${upiId}&pn=${driverName}&am=${amount}&cu=INR`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Pay</Text>
      <Text style={styles.subtitle}>Pay ₹{amount} to {driverName}</Text>

      <View style={styles.qrContainer}>
        <QRCode value={upiUrl} size={220} />
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => router.replace('/driverprocess')}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UpiPayment;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

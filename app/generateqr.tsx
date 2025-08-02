import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const UpiPayment = () => {
  const {
    amount,
    driverName,
  } = useLocalSearchParams();

  const router = useRouter();

  const upiId = 'rider@upi';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${driverName}&am=${amount}&cu=INR`;

  const handleContinue = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Error', 'Driver not logged in.');
        return;
      }

      const amt = parseFloat(amount as string);
      if (isNaN(amt) || amt <= 0) {
        Alert.alert('Invalid Amount', 'The amount to be added is not valid.');
        return;
      }
  const driverRef = firestore().collection('users').doc(user.uid);
  const driverDoc = await driverRef.get();
  const driverData = driverDoc.data();
  const currentWallet = typeof driverData?.wallet === 'number' ? driverData.wallet : 0;


      await driverRef.update({
        wallet: currentWallet + amt,
        transactions: firestore.FieldValue.arrayUnion({
          amount: amt,
          from: upiId,
          type: 'UPI Credit',
          timestamp: new Date().toISOString(),
        }),
      });

      Alert.alert('Payment Added', `₹${amt} has been added to your wallet.`);
      router.replace('/driverprocess');

    } catch (error) {
      console.error('Wallet update error:', error);
      Alert.alert('Error', 'Something went wrong while updating the wallet.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Pay</Text>
      <Text style={styles.subtitle}>Pay ₹{amount} to {driverName}</Text>

      <View style={styles.qrContainer}>
        <QRCode value={upiUrl} size={220} />
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
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

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const UpiPaymentScreen = () => {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const [upiId, setUpiId] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const validateUpi = (id: string) => /^[\w.-]+@[\w]+$/.test(id);

  const handleSave = async () => {
    if (!validateUpi(upiId)) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. name@bank)');
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    try {
      await firestore().collection('users').doc(user.uid).set({ upiId }, { merge: true });
      setScannerVisible(true);
      setScanned(false);
    } catch (error) {
      console.error('Firestore Error:', error);
      Alert.alert('Error', 'Failed to save UPI info.');
    }
  };

  const handleQrScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannerVisible(false);

    Alert.alert(
      'Confirm Payment',
      `Pay ₹${amount} to:\n\n${data}\n\nDo you want to proceed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Confirm',
          onPress: async () => {
            const user = auth().currentUser;
            if (!user) return;

            const userRef = firestore().collection('users').doc(user.uid);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            const wallet = userData?.wallet ?? 0;
            const amt = parseFloat(amount);

            if (wallet < amt) {
              Alert.alert('Insufficient Balance', 'Your wallet does not have enough funds.');
              return;
            }

            try {
              await userRef.update({
                wallet: wallet - amt,
                transactions: firestore.FieldValue.arrayUnion({
                  amount: amt,
                  to: data,
                  timestamp: new Date().toISOString(),
                  type: 'UPI Payment',
                }),
              });
              Alert.alert('Payment Successful', `₹${amt} paid to ${data}`);
              router.replace('/drawer/home');
            } catch (err) {
              console.error('Transaction Error:', err);
              Alert.alert('Error', 'Transaction failed.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>Add UPI Payment Info</Text>

        <Text style={styles.label}>Enter your UPI ID</Text>
        <TextInput
          style={styles.input}
          placeholder="example@bank"
          value={upiId}
          onChangeText={setUpiId}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save and Scan QR</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={scannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => handleQrScan({ data })}
            />
          ) : (
            <Text style={styles.permissionText}>Camera permission not granted</Text>
          )}
          <TouchableOpacity style={styles.cancelScanner} onPress={() => setScannerVisible(false)}>
            <Text style={styles.cancelText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default UpiPaymentScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1E88E5',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 24,
    color: 'white'
  },
  button: {
    backgroundColor: '#1E88E5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  cancelScanner: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  cancelText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
});

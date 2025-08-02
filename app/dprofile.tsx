import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [wallet, setWallet] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;      <Modal transparent visible={withdrawModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Withdraw from Wallet</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setWithdrawModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmWithdraw}>
                <Text style={styles.modalConfirmText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      if (!user) return;

      const docRef = firestore().collection('users').doc(user.uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({
          name: '',
          email: '',
          gender: '',
          dob: '',
          wallet: 0,
          vehicleType: '',
        });
        setFullName('');
        setEmail('');
        setGender('');
        setDob('');
        setWallet(0);
      } else {
        const data = doc.data();
        if (data) {
          setFullName(data.name || '');
          setEmail(data.email || '');
          setGender(data.gender || '');
          setDob(data.dob || '');
          setWallet(typeof data.wallet === 'number' ? data.wallet : 0);
          setVehicleType(data.vehicleType || '');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  const updateProfileInFirestore = async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).set(
        {
          name: fullName,
          email,
          gender,
          dob,
          vehicleType,
        },
        { merge: true }
      );
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  const handleWithdraw = () => {
    setWithdrawAmount('');
    setWithdrawModalVisible(true);
  };

  const confirmWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to withdraw.');
      return;
    }

    if (amount > wallet) {
      Alert.alert('Insufficient Balance', 'You do not have enough funds to withdraw this amount.');
      return;
    }

    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).update({
        wallet: firestore.FieldValue.increment(-amount),
      });
      setWallet((prev) => prev - amount);
      setWithdrawModalVisible(false);
      Alert.alert('Withdrawal Successful', `₹${amount.toFixed(2)} withdrawn from your wallet.`);
    } catch (error) {
      console.error('Withdraw error:', error);
      Alert.alert('Error', 'Could not withdraw from wallet.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const user = auth().currentUser;
            if (user) {
              await user.delete();
              router.replace('/login');
            }
          } catch (err) {
            console.error('Account deletion error:', err);
            Alert.alert('Error', 'Unable to delete account.');
          }
        },
      },
    ]);
  };

  const getAvatarImage = () => {
    switch (gender) {
      case 'Female':
        return require('../assets/images/female.png');
      case 'Other':
        return require('../assets/images/others.png');
      case 'Male':
      default:
        return require('../assets/images/male.png');
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/driverprocess');
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <Image source={getAvatarImage()} style={styles.avatar} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput style={styles.input} value={dob} onChangeText={setDob} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type of Vehicle</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={vehicleType}
              onValueChange={(itemValue) => setVehicleType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select vehicle type" value="" />
              <Picker.Item label="Bike" value="Bike" />
              <Picker.Item label="Cab AC" value="Cab AC" />
              <Picker.Item label="Cab Non AC" value="Cab Non AC" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wallet Balance</Text>
          <View style={styles.walletRow}>
            <Text style={styles.walletAmount}>₹{wallet.toFixed(2)}</Text>
            <TouchableOpacity style={styles.rechargeButton} onPress={handleWithdraw}>
              <Text style={styles.rechargeText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={updateProfileInFirestore}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonDelete} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={withdrawModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Withdraw from Wallet</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setWithdrawModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmWithdraw}>
                <Text style={styles.modalConfirmText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111', marginBottom: 24 },
  avatar: {
    height: 100, width: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 24, backgroundColor: '#ddd',
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#f2f2f2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#000',
  },
  pickerWrapper: { backgroundColor: '#f2f2f2', borderRadius: 8, overflow: 'hidden' },
  picker: { height: 50, color: '#000' },
  walletRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f2f2f2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
  },
  walletAmount: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  rechargeButton: {
    backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6,
  },
  rechargeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  saveButton: {
    backgroundColor: '#1E88E5', paddingVertical: 14, borderRadius: 8, marginTop: 10, alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonLogout: {
    backgroundColor: '#f44336', paddingVertical: 14, borderRadius: 8, marginTop: 20, alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonDelete: { paddingVertical: 14, marginTop: 8, alignItems: 'center' },
  deleteText: { color: '#f44336', fontWeight: '600', fontSize: 16 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalContainer: {
    width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black' },
  modalInput: {
    width: '100%', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10,
    marginBottom: 20, fontSize: 16, color: 'black',
  },
  modalButtonRow: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
  },
  modalCancel: {
    backgroundColor: '#ccc', padding: 10, borderRadius: 8, flex: 1, marginRight: 10, alignItems: 'center',
  },
  modalCancelText: { fontWeight: '600' },
  modalConfirm: {
    backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, flex: 1, marginLeft: 10, alignItems: 'center',
  },
  modalConfirmText: { color: '#fff', fontWeight: '600' },
});
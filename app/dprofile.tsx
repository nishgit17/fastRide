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
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [wallet, setWallet] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (!user) return;

      const docRef = firestore().collection('users').doc(user.uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        // New user – create default empty document
        await docRef.set({
          name: '',
          email: '',
          gender: '',
          dob: '',
          wallet: 0,
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
        },
        { merge: true }
      );
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  const handleRecharge = () => {
    setRechargeAmount('');
    setRechargeModalVisible(true);
  };

  const confirmRecharge = async () => {
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid recharge amount.');
      return;
    }

    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).update({
        wallet: firestore.FieldValue.increment(amount),
      });
      setWallet((prev) => prev + amount);
      setRechargeModalVisible(false);
      Alert.alert('Recharge Successful', `₹${amount.toFixed(2)} added to your wallet.`);
    } catch (error) {
      console.error('Recharge error:', error);
      Alert.alert('Error', 'Could not recharge wallet.');
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
          <Text style={styles.label}>Wallet Balance</Text>
          <View style={styles.walletRow}>
            <Text style={styles.walletAmount}>₹{wallet.toFixed(2)}</Text>
            <TouchableOpacity style={styles.rechargeButton} onPress={handleRecharge}>
              <Text style={styles.rechargeText}>Recharge</Text>
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

      {/* Recharge Modal */}
      <Modal transparent visible={rechargeModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Recharge Wallet</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={rechargeAmount}
              onChangeText={setRechargeAmount}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setRechargeModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmRecharge}>
                <Text style={styles.modalConfirmText}>Add</Text>
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalInput: {
    width: '100%', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10,
    marginBottom: 20, fontSize: 16,
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

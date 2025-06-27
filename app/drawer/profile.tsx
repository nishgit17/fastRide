import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('Nishant');
  const [email, setEmail] = useState('nishantpandey1709@gmail.com');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('17/09/2006');

  const handleLogout = async () => {
    try {
      await auth().signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
      ]
    );
  };

  const getAvatarImage = () => {
    switch (gender) {
      case 'Female':
        return require('../../assets/images/female.png');
      case 'Other':
        return require('../../assets/images/others.png');
      case 'Male':
      default:
        return require('../../assets/images/male.png');
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/drawer/home'); // Navigate to Home
      return true; // Prevent default behavior (exit app)
    });

    return () => backHandler.remove(); // ✅ Cleanup
  }, []);


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <Image source={getAvatarImage()} style={styles.avatar} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
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
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
          />
        </View>

        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonDelete} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 24,
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 24,
    backgroundColor: '#ddd',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  pickerWrapper: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#000',
  },
  buttonLogout: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDelete: {
    paddingVertical: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: '#f44336',
    fontWeight: '600',
    fontSize: 16,
  },
});

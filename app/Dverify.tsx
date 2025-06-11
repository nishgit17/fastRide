import auth from '@react-native-firebase/auth';
import { useLocalSearchParams } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Dverify = () => {
  const [password, setPassword] = useState('');
  const { email } = useLocalSearchParams() as { email: string };

  const handleLogin = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      Alert.alert('Login failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Enter your password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.emailText}>Email: {email}</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Dverify;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 32,
    marginTop: 28,
    marginBottom: 16,
  },
  inputContainer: {
    alignItems: 'center',
  },
  emailText: {
    color: 'gray',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    height: 48,
    width: 320,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 260, // Similar spacing as mb-64
  },
  button: {
    height: 48,
    backgroundColor: '#E2E8F0',
    borderRadius: 25,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 280, // Adjusted instead of mt-80
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

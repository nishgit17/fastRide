import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Image2 from '../assets/images/Riderlogin.png'; // Your custom image

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // Replace with your actual client ID
  scopes: ['profile', 'email'],
});

const Dmail = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    if (isSignUp) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(password)) {
        Alert.alert(
          'Weak Password',
          'Password must be at least 6 characters long and include an uppercase letter, number, and special character.'
        );
        return;
      }
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await auth().createUserWithEmailAndPassword(email, password);
      } else {
        await auth().signInWithEmailAndPassword(email, password);
      }
      router.push('/home'); // Navigate after login/signup
    } catch (error: any) {
      Alert.alert(isSignUp ? 'Signup Failed' : 'Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
      await auth().signInWithCredential(googleCredential);
      router.push('/home');
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={Image2} style={styles.image} resizeMode="cover" />

        <Text style={styles.heading}>{isSignUp ? 'Sign Up' : 'Login with Email'}</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            keyboardType="email-address"
            placeholder="example@example.com"
            placeholderTextColor="gray"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to the T&C and Privacy Policy.
        </Text>

        <TouchableOpacity onPress={handleFormSubmit} style={styles.loginButton} disabled={loading}>
          <Text style={styles.loginButtonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleLink}>
          <Text style={styles.toggleLinkText}>
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoogleButtonPress} style={styles.googleButton} disabled={loading}>
          <Text style={styles.loginButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: 'flex-start',
  },
  image: {
    height: 200,
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 12,
    paddingLeft: 20,
    paddingBottom: 16,
  },
  inputContainer: {
    marginLeft: 20,
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    height: 64,
    marginBottom: 16,
    justifyContent: 'center',
  },
  textInput: {
    paddingLeft: 16,
    fontSize: 18,
  },
  terms: {
    paddingLeft: 40,
    paddingRight: 40,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 16,
  },
  loginButton: {
    height: 48,
    backgroundColor: '#4285F4',
    borderRadius: 25,
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  googleButton: {
    height: 48,
    backgroundColor: '#4285F4',
    borderRadius: 25,
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  toggleLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  toggleLinkText: {
    color: '#007aff',
    fontSize: 16,
  },
});

export default Dmail;

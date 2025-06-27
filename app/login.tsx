import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Image2 from '../assets/images/Untitled.png';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // Replace with actual value
  scopes: ['profile', 'email'],
});

const LoginScreen = () => {
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
      router.push('/drawer/home');
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
      router.push('/drawer/home');
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoiding}
    >
      <View style={styles.container}>
        {/* Scrollable form content */}
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image source={Image2} style={styles.image} resizeMode="contain" />
          <Text style={styles.heading}>
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#aaa"
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
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={handleFormSubmit} style={styles.primaryButton} disabled={loading}>
            <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.linkContainer}>
            <Text style={styles.linkText}>
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onGoogleButtonPress} style={styles.outlineButton} disabled={loading}>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Terms text at bottom */}
        <View style={styles.footer}>
          <Text style={styles.terms}>
            By continuing, you agree to the Terms & Conditions and Privacy Policy.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
);


};

const styles = StyleSheet.create({
  image: {
    height: 160,
    width: '100%',
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#1E88E5',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#007aff',
    fontSize: 14,
  },
  pageContainer: {
  flex: 1,
  justifyContent: 'flex-start',
  backgroundColor: '#fff',
},
scrollContainer: {
  paddingHorizontal: 24,
  paddingTop: 40,
  paddingBottom: 24,
},
bottom: {
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderTopWidth: 0.5,
  borderColor: '#ccc',
  backgroundColor: '#fff',
},
safeArea: {
  flex: 1,
  backgroundColor: '#fff',
},
keyboardAvoiding: {
  flex: 1,
},
container: {
  flex: 1,
  justifyContent: 'space-between',
},
formScroll: {
  flex: 1,
},
scrollContent: {
  paddingHorizontal: 24,
  paddingTop: 40,
  paddingBottom: 20,
},
footer: {
  padding: 16,
  borderTopWidth: 0.5,
  borderColor: '#ccc',
  backgroundColor: '#fff',
  paddingBottom: 52,
},
terms: {
  fontSize: 12,
  color: '#888',
  textAlign: 'center',
},


});

export default LoginScreen;

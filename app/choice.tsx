import { Link } from 'expo-router';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Choice = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e0f7f9" />

      <Text style={styles.title}>Welcome to fastRide</Text>
      <Text style={styles.subtitle}>Choose your role to continue</Text>

      <Link href="/Dindex" asChild>
        <TouchableOpacity style={[styles.button, styles.captainButton]}>
          <Icon name="directions-car" size={26} color="#1e3a8a" />
          <Text style={[styles.buttonText, { color: '#1e3a8a' }]}>Sign In as Captain</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/login" asChild>
        <TouchableOpacity style={[styles.button, styles.riderButton]}>
          <Icon name="person" size={26} color="#065f46" />
          <Text style={[styles.buttonText, { color: '#065f46' }]}>Sign In as Rider</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  captainButton: {
    borderColor: '#1e3a8a',
  },
  riderButton: {
    borderColor: '#065f46',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default Choice;

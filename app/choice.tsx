import { useRouter } from 'expo-router';
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
  const router = useRouter(); 

  const handleDrivePress = () => {
    router.push('/Dindex'); 
  };

  const handleRidePress = () => {
    router.push('/login'); 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e0f7fa" />

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>fastRide </Text>
        <Icon name="local-taxi" size={42} color="#facc15" style={styles.logoIcon} />
      </View>

      <Text style={styles.subtitle}>Get moving in minutes</Text>
      <Text style={styles.description}>Choose your role to continue your journey with us.</Text>

      <View style={styles.mainSpacer} />

      <TouchableOpacity
        style={[styles.button, styles.captainButton]}
        onPress={handleDrivePress}
      >
        <Icon name="drive-eta" size={26} color="#fff" />
        <Text style={styles.buttonText}>Drive with fastRide</Text>
      </TouchableOpacity>
    
      <TouchableOpacity
        style={[styles.button, styles.riderButton]}
        onPress={handleRidePress}
      >
        <Icon name="person-pin-circle" size={26} color="#fff" />
        <Text style={styles.buttonText}>Ride with fastRide</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24, 
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, 
  },
  logo: {
    fontSize: 44, 
    fontWeight: '900',
    color: '#0f172a', 
  },
  logoIcon: {
    marginLeft: 8, 
  },
  subtitle: {
    fontSize: 24, 
    fontWeight: '700', 
    color: '#334155', 
    marginBottom: 8,
    textAlign: 'center', 
  },
  description: {
    fontSize: 16, 
    color: '#64748b', 
    marginBottom: 50, 
    textAlign: 'center',
    paddingHorizontal: 10, 
  },
  mainSpacer: {
    height: 10, 
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%', 
    paddingVertical: 18, 
    borderRadius: 30, 
    marginBottom: 16, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, 
    shadowRadius: 6,
    elevation: 8, 
  },
  captainButton: {
    backgroundColor: '#1d4ed8', 
  },
  riderButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    fontSize: 18, 
    color: '#fff', 
    fontWeight: '700',
    marginLeft: 12, 
  },
});

export default Choice;
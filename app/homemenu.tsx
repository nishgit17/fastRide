import { getAuth, signOut } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Homemenu = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth); // Firebase sign out
      router.replace('/choice'); // Reset navigation to the choice page
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSignOut}>
        <View style={styles.signOutButton}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Homemenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // vertically center
    alignItems: 'center',     // horizontally center
    backgroundColor: '#fff',
  },
  signOutButton: {
    width: 140,
    height: 48,
    backgroundColor: '#87CEFA', // light blue
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

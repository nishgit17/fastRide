import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const Dindex = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Dlogin');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.header}>rapido</Text>
        <Text style={styles.subHeader}>Captain</Text>
        <ActivityIndicator size="small" color="#FFD700" style={styles.loadingIndicator} />
        <Text style={styles.waitText}>Please Wait...</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made in India 🇮🇳</Text>
      </View>
    </View>
  );
};

export default Dindex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 66,
    fontWeight: 'bold',
    color: '#000',
  },
  subHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingIndicator: {
    marginTop: 50,
    transform: [{ scale: 1.5 }],
  },
  waitText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 80,  // Reduced padding to lift text upward
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
});

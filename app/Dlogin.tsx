import { Link } from 'expo-router';
import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Image2 from '../assets/images/Riderhome.png';

const Dlogin = () => {
  return (
    <View style={styles.container}>
      <Image
        source={Image2}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={[styles.title, { marginBottom: 0 }]}>
          Drive and Earn up to 
        </Text>
        <Text style={[styles.title, { marginTop: 4 }]}>
          ₹15000/week
        </Text>
        <Text style={styles.subText}>Made in 🇮🇳</Text>

        <Link href="/Dmail" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              Start Driving
            </Text>
          </TouchableOpacity>
        </Link>

        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://your-link.com')}
        >
          Book in the Customer App!
        </Text>
      </View>
    </View>
  );
};

export default Dlogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: 400,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 32, // equivalent to text-4xl
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: 'black',
    marginTop: 48, // mt-12 ≈ 48px
  },
  subText: {
    fontSize: 16, // approx text-base
    color: '#6b7280', // approximate gray color
    marginTop: 20,
    marginBottom: 156,
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
  
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

import { Link } from "expo-router";
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Image2 from '../assets/images/goRapido.png';
import Image3 from '../assets/images/rapidooffer.png';

const Home = () => {
  const [searchText, setSearchText] = useState('');

  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove(); 
  }, [])
);


  return (
    <View style={{ backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>

      {/* Search bar */}
      <View style={styles.searchContainer}>
      <Link href = "/homemenu" asChild>
        <TouchableOpacity onPress={() => console.log('Menu button pressed')}>
          <View style={styles.menuButton}>
            <MaterialCommunityIcons name="menu" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </Link>
        <TextInput
          style={styles.searchInput}
          placeholder="Search destination"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Explore title */}
      <Text style={styles.sectionTitle}>Explore</Text>

      {/* Services */}
      <View style={styles.servicesRow}>

        <Link href = "/parcel" asChild>
          <TouchableOpacity style={styles.serviceButton}>
            <MaterialCommunityIcons name="package-variant-closed" size={28} color="brown" />
            <Text style={styles.serviceText}>Parcel</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href = "/selectlocation" asChild>
          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="car" size={28} color="black" />
            <Text style={styles.serviceText}>Cab</Text>
          </TouchableOpacity>
        </Link>

        <Link href = "/selectlocation" asChild>
          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="bicycle" size={28} color="red" />
            <Text style={styles.serviceText}>Bike</Text>
          </TouchableOpacity>
        </Link>

      </View>

      {/* Promo Image */}
      <Image source={Image3} style={styles.promoImage} resizeMode="contain" />

      {/* Bottom image */}
      <Image source={Image2} style={styles.bottomImage} resizeMode="cover" />
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 30,
    marginTop: 20,
  },
  menuButton: {
    marginRight: 10,
    padding: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  serviceButton: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  serviceText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  promoImage: {
    width: '100%',
    height: 180,
    marginBottom: 30,
  },
  bottomImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
});
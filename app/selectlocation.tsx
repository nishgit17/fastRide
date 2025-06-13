import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const SelectLocation = () => {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Pickup Container */}
      <View style={styles.locationContainer}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: 'green' }]} />
          <Text style={[styles.label, { color: 'green' }]}>Pickup</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Your Current Location"
          placeholderTextColor="#666"
          value={pickup}
          onChangeText={setPickup}
        />
      </View>

      {/* Drop Container */}
      <View style={styles.locationContainer}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: 'red' }]} />
          <Text style={[styles.label, { color: 'red' }]}>Drop</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Search Drop Location"
          placeholderTextColor="#666"
          value={drop}
          onChangeText={setDrop}
        />
      </View>

      <Text style={styles.sectionTitle}>Drop Suggestions</Text>
    </ScrollView>
  );
};

export default SelectLocation;


const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  locationContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 6,
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 0,
    marginTop: 16,
  },
});

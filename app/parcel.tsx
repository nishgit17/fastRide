import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const features = [
  {
    title: "We don’t purchase",
    subtitle: "Our captains won’t pay and buy items on your behalf",

  },
  {
    title: "Watch the Weight",
    subtitle: "Maximum allowed weight per order is 7kg",

  },
  {
    title: "Cash Payment available",
    subtitle: "Cash payment is available at both pickup or drop locations",

  },
];
const router = useRouter();

export default function ParcelScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingVertical: 20 }}>
      
      {/* Horizontal Info Cards at Top */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {features.map((feature, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{feature.title}</Text>
              <Text style={styles.subtitle}>{feature.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Main Content Below */}
      <View style={styles.mainContent}>
        <Text style={styles.mainTitle}>What do you wish to do today?</Text>
        <Text style={styles.mainSubtitle}>
          You can send and receive packages with our parcel services
        </Text>

        <TouchableOpacity style={styles.sendBtn} onPress={() => router.push('/parcellocation')}>
          <Text style={styles.sendText}>Send Parcel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.receiveBtn} onPress={() => router.push('/parcellocation')}>
          <Text style={styles.receiveText}>Receive Parcel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: screenWidth * 0.85,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 120,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  image: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  mainContent: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mainTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 200,
    marginBottom: 10,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 200,
  },
  sendBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
  },
  receiveBtn: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
  },
  sendText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  receiveText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
});

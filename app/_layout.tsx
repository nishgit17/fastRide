import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

export default function RootLayout() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthChecked) return;
    
    // Use push instead of replace to maintain navigation history
    if (isLoggedIn) {
      router.push('/drawer/home');
    } else {
      router.push('/choice');
    }
  }, [isAuthChecked, isLoggedIn]);

  if (!isAuthChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <Stack>
      {/* Common screens */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="nextindex" options={{ headerShown: false }} />
      <Stack.Screen name="choice" options={{ headerShown: false }} />
      
      {/* Authentication screens */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="Dmail" options={{ headerShown: false }} />
      <Stack.Screen name="Dindex" options={{ headerShown: false }} />
      <Stack.Screen name="Dlogin" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen
        name="Dverify"
        options={{
          headerTitle: 'Verify Password',
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
          },
          headerBackTitle: '.',
        }}
      />
      
      {/* Main app screens */}
      <Stack.Screen name="drawer" options={{ headerShown: false }} />
      <Stack.Screen name="homemenu" options={{ headerShown: false }} />
      <Stack.Screen name="finaliseride" options={{ headerShown: false }} />
      
      {/* Location/ride screens */}
      <Stack.Screen
        name="selectlocation"
        options={{
          headerTitle: 'Home',
          headerTitleAlign: 'left',
          headerTintColor: 'blue',
          headerTitleStyle: {
            fontSize: 20,
          },
        }}
      />

      <Stack.Screen
        name="selectlocationworking"
        options={{
          headerTitle: 'Home',
          headerTitleAlign: 'left',
          headerTintColor: 'blue',
          headerTitleStyle: {
            fontSize: 20,
          },
        }}
      />
      
      {/* Parcel screens */}
      <Stack.Screen
        name="parcel"
        options={{
          headerTitle: 'Parcel',
          headerTitleAlign: 'center',
          headerTintColor: 'black',
          headerTitleStyle: {
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('./parcelroute')}
              style={{ marginRight: 10 }}
            >
              <Ionicons name='information-circle-outline' size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="parcelroute"
        options={{
          headerTitle: 'Parcel',
          headerTitleAlign: 'center',
          headerTintColor: 'black',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
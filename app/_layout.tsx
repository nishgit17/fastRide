import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

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
    if (isAuthChecked) {
      if (isLoggedIn) {
        router.replace('/home'); // redirect if logged in
      } else {
        router.replace('/choice'); // redirect if not logged in
      }
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="nextindex" options={{ headerShown: false }} />
      <Stack.Screen name="choice" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="Dmail" options={{ headerShown: false }} />
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
      <Stack.Screen name="Dindex" options={{ headerShown: false }} />
      <Stack.Screen name="Dlogin" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="homemenu" options={{ headerShown: false }} />
    </Stack>
  );
}

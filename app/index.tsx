
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/nextindex');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FACC15' }}>
      <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#000' }}>fastRide</Text>
    </View>
  );
}
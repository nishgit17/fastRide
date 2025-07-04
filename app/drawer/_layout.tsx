import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false, // ✅ Hide header for all screens
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Drawer>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Region } from 'react-native-maps';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware'; // ✅ import this too

type Coord = {
  latitude: number;
  longitude: number;
};

interface MapState {
  markerCoord: Coord;
  region: Region;
  selectedAddress: string;
  hasHydrated: boolean; // ✅ NEW
  setMarkerCoord: (coord: Coord) => void;
  setRegion: (region: Region) => void;
  setSelectedAddress: (address: string) => void;
  setHasHydrated: (value: boolean) => void; // ✅ NEW
}


export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      markerCoord: {
        latitude: 22.5726,
        longitude: 88.3639,
      },
      region: {
        latitude: 22.5726,
        longitude: 88.3639,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      selectedAddress: '',
      hasHydrated: false, // ✅
      setMarkerCoord: (coord) => set({ markerCoord: coord }),
      setRegion: (region) => set({ region }),
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      setHasHydrated: (value) => set({ hasHydrated: value }), // ✅
    }),
    {
      name: 'map-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // ✅ set hydration flag once state is rehydrated
        state?.setHasHydrated(true);
      },
    }
  )
);

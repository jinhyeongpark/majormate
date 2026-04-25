import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { tokenStorage } from '../src/auth/tokenStorage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!fontsLoaded) return;
    tokenStorage.get().then((token) => {
      if (token) router.replace('/(tabs)');
      setAuthChecked(true);
      SplashScreen.hideAsync();
    });
  }, [fontsLoaded]);

  if (!fontsLoaded || !authChecked) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="character-setup" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

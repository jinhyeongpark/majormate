import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AuthContext } from '../src/auth/AuthContext';
import { tokenStorage } from '../src/auth/tokenStorage';
import { appendPendingQaRequest } from './(tabs)/qa-inbox';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 최초 1회 기동 시 초기 라우팅만 담당 (로그아웃은 (tabs)/_layout.tsx의 <Redirect>가 처리)
function AuthRedirect({ isAuthenticated }: { isAuthenticated: boolean | null }) {
  const router = useRouter();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (initializedRef.current) return;

    initializedRef.current = true;
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
    SplashScreen.hideAsync();
  }, [isAuthenticated]);

  return null;
}

function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as Record<string, unknown>;
      if (data?.type === 'QA_REQUEST' && data.requestPayload) {
        appendPendingQaRequest(data.requestPayload as Parameters<typeof appendPendingQaRequest>[0]);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      if (!data) return;

      if (data.type === 'QA_REQUEST' && data.requestPayload) {
        appendPendingQaRequest(data.requestPayload as Parameters<typeof appendPendingQaRequest>[0]);
        router.push('/(tabs)/qa-inbox');
      } else if (data.type === 'QA_CHAT' && data.chatRoomId) {
        router.push(`/qa/chat/${data.chatRoomId as string}`);
      } else if (data.type === 'FRIEND_STUDYING') {
        router.push('/(tabs)');
      }
    });
    return () => subscription.remove();
  }, [router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!fontsLoaded) return;
    tokenStorage.get().then((token) => {
      setAuthenticated(!!token);
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      <AuthRedirect isAuthenticated={isAuthenticated} />
      <NotificationHandler />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="character-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="qa/chat/[chatRoomId]" />
        <Stack.Screen name="room/[roomId]" />
      </Stack>
    </AuthContext.Provider>
  );
}

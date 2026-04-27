import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  // undefined = 아직 확인 중, false = 미로그인, true = 로그인됨
  const [authState, setAuthState] = useState<boolean | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (!fontsLoaded) return;
    tokenStorage.get().then((token) => {
      setAuthState(!!token);
      SplashScreen.hideAsync();
    });
  }, [fontsLoaded]);

  // Stack 마운트 후 로그인 상태면 탭으로 이동
  useEffect(() => {
    if (authState === true) router.replace('/(tabs)');
  }, [authState]);

  // 포그라운드 알림 수신 — QA_REQUEST를 pending 목록에 저장
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as Record<string, unknown>;
      if (data?.type === 'QA_REQUEST' && data.requestPayload) {
        appendPendingQaRequest(data.requestPayload as Parameters<typeof appendPendingQaRequest>[0]);
      }
    });

    return () => subscription.remove();
  }, []);

  // 푸시 알림 응답(탭) 딥링크 라우팅
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      if (!data) return;

      // QA_REQUEST 알림 탭 시 pending 목록에 저장 후 수신함으로 이동
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

  if (!fontsLoaded || authState === undefined) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="character-setup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="qa/chat/[chatRoomId]" />
    </Stack>
  );
}

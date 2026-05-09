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

// 인증 상태에 따라 최초 1회 초기 라우팅 + 이후 로그아웃 감지
function AuthRedirect({ isAuthenticated }: { isAuthenticated: boolean | null }) {
  const router = useRouter();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated === null) return; // 아직 토큰 확인 중

    if (!initializedRef.current) {
      // 최초 인증 상태 확인 완료 — 적절한 화면으로 이동 후 스플래시 제거
      initializedRef.current = true;
      if (isAuthenticated) {
        router.replace('/(tabs)');
      }
      SplashScreen.hideAsync();
      return;
    }

    // 이후 변화: 로그아웃 시에만 로그인 화면으로 이동
    if (!isAuthenticated) {
      router.replace('/');
    }
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

function RootNavigator({ isAuthenticated }: { isAuthenticated: boolean | null }) {
  return (
    <>
      <AuthRedirect isAuthenticated={isAuthenticated} />
      <NotificationHandler />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="character-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="qa/chat/[chatRoomId]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!fontsLoaded) return;
    // SplashScreen.hideAsync()는 AuthRedirect에서 토큰 확인 후 호출
    tokenStorage.get().then((token) => {
      setAuthenticated(!!token);
    });
  }, [fontsLoaded]);

  // 폰트 로드 전에만 null 반환 (스플래시 유지)
  // isAuthenticated === null 이어도 Stack은 렌더링 — 스플래시가 가려줌
  if (!fontsLoaded) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      <RootNavigator isAuthenticated={isAuthenticated} />
    </AuthContext.Provider>
  );
}

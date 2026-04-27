import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiClient } from './client';

export async function registerFcmToken(): Promise<void> {
  try {
    if (!Device.isDevice) {
      // 에뮬레이터에서는 푸시 토큰을 받을 수 없으므로 조용히 건너뜀
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4FC3F7',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      // 권한 거부 시 조용히 종료
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await apiClient.post('/api/users/me/fcm-token', { token });
  } catch {
    // 에뮬레이터 또는 네트워크 오류 시 앱이 멈추지 않도록 무시
  }
}

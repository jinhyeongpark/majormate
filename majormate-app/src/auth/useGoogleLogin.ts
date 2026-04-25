import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { apiClient } from '../api/client';
import { tokenStorage } from './tokenStorage';

WebBrowser.maybeCompleteAuthSession();

export interface LoginResult {
  token: string;
  isNewUser: boolean;
}

export function useGoogleLogin() {
  const [request, , promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
  });

  const login = async (): Promise<LoginResult> => {
    const result = await promptAsync();
    if (result.type !== 'success') {
      throw new Error('로그인이 취소되었습니다.');
    }
    const accessToken = result.authentication?.accessToken;
    const { data } = await apiClient.post<LoginResult>('/api/auth/google', { accessToken });
    await tokenStorage.set(data.token);
    return data;
  };

  return { login, ready: !!request };
}

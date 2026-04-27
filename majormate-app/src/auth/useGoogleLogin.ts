import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { apiClient } from '../api/client';
import { tokenStorage } from './tokenStorage';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  offlineAccess: false,
  scopes: ['email', 'profile'],
});

export interface LoginResult {
  token: string;
  isNewUser: boolean;
}

export function useGoogleLogin() {
  const login = async (): Promise<LoginResult> => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signIn();
    const { idToken, accessToken } = await GoogleSignin.getTokens();
    if (!accessToken) throw new Error('Google 토큰을 가져오지 못했습니다.');
    const { data } = await apiClient.post<LoginResult>('/api/auth/google', { idToken: idToken ?? null, accessToken });
    await tokenStorage.set(data.token);
    return data;
  };

  return { login, ready: true };
}

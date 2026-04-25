import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@auth_token';

export const tokenStorage = {
  get: (): Promise<string | null> => AsyncStorage.getItem(KEY),
  set: (token: string): Promise<void> => AsyncStorage.setItem(KEY, token),
  remove: (): Promise<void> => AsyncStorage.removeItem(KEY),
};

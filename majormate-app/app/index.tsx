import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGoogleLogin } from '../src/auth/useGoogleLogin';

export default function LoginScreen() {
  const router = useRouter();
  const { login, ready } = useGoogleLogin();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { isNewUser } = await login();
      router.replace(isNewUser ? '/onboarding' : '/(tabs)');
    } catch {
      Alert.alert('로그인 실패', '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MajorMate</Text>
      <Text style={styles.tagline}>전공으로 연결되는{'\n'}공부 플랫폼</Text>

      <TouchableOpacity
        style={[styles.googleButton, (!ready || loading) && styles.disabled]}
        onPress={handleGoogleLogin}
        disabled={!ready || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <AntDesign name="google" size={18} color="#fff" />
        )}
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  logo: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 22,
    color: '#4FC3F7',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#555',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2B3580',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomColor: '#1a2160',
    borderRightColor: '#1a2160',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#4d5fa8',
    borderLeftColor: '#4d5fa8',
  },
  disabled: {
    opacity: 0.5,
  },
  googleButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 1,
  },
});

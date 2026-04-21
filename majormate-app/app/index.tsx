import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    // OAuth flow: redirects to backend /oauth2/authorization/google
    // After success, backend redirects to /api/auth/me
    // The app then navigates to onboarding if profile is incomplete
    router.push('/onboarding');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MajorMate</Text>
      <Text style={styles.tagline}>전공으로 연결되는 공부 플랫폼</Text>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleButtonText}>Google로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#5B2EE0',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});

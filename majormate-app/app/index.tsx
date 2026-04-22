import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    router.push('/onboarding');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MajorMate</Text>
      <Text style={styles.tagline}>전공으로 연결되는{'\n'}공부 플랫폼</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <AntDesign name="google" size={18} color="#fff" />
        <Text style={styles.googleButtonText}>Google로 시작하기</Text>
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
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  googleButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 1,
  },
});

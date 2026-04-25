import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MajorSearchInput from '../components/MajorSearchInput';
import { API_BASE_URL } from '../constants/api';

const GENDERS = [
  { label: 'MALE', value: 'MALE' },
  { label: 'FEMALE', value: 'FEMALE' },
  { label: 'OTHER', value: 'OTHER' },
  { label: 'PRIVATE', value: 'PREFER_NOT_TO_SAY' },
] as const;

type Gender = (typeof GENDERS)[number]['value'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  const handleNext = async () => {
    if (nickname.trim().length < 2) {
      Alert.alert('닉네임은 2자 이상이어야 합니다.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nickname, major, nationality, gender }),
      });

      if (!res.ok) throw new Error('프로필 저장 실패');
    } catch {
      // 백엔드 미연동 시에도 UI 플로우 진행
    }
    router.replace('/character-setup');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>PROFILE</Text>
      <Text style={styles.subtitle}>set up your profile</Text>

      <View style={styles.field}>
        <Text style={styles.label}>NICKNAME *</Text>
        <TextInput
          style={styles.input}
          placeholder="2-20 chars"
          placeholderTextColor="#444"
          value={nickname}
          onChangeText={setNickname}
          maxLength={20}
        />
      </View>

      <View style={[styles.field, { zIndex: 10 }]}>
        <Text style={styles.label}>MAJOR</Text>
        <MajorSearchInput value={major} onChange={setMajor} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>NATIONALITY</Text>
        <TextInput
          style={styles.input}
          placeholder="KR / US / JP"
          placeholderTextColor="#444"
          value={nationality}
          onChangeText={setNationality}
          maxLength={2}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>GENDER</Text>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.chip, gender === g.value && styles.chipSelected]}
              onPress={() => setGender(g.value)}
            >
              <Text style={[styles.chipText, gender === g.value && styles.chipTextSelected]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>NEXT →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#111111',
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 20,
    color: '#4FC3F7',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#555',
    marginBottom: 40,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#888',
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chipSelected: {
    backgroundColor: '#2B3580',
    borderColor: '#4FC3F7',
  },
  chipText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#666',
  },
  chipTextSelected: {
    color: '#4FC3F7',
  },
  nextButton: {
    backgroundColor: '#2B3580',
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomColor: '#1a2160',
    borderRightColor: '#1a2160',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#4d5fa8',
    borderLeftColor: '#4d5fa8',
  },
  nextButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 3,
  },
});

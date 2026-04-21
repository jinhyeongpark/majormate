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
import { API_BASE_URL } from '../constants/api';

const GENDERS = [
  { label: '남성', value: 'MALE' },
  { label: '여성', value: 'FEMALE' },
  { label: '기타', value: 'OTHER' },
  { label: '비공개', value: 'PREFER_NOT_TO_SAY' },
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
      router.push('/character-setup');
    } catch {
      Alert.alert('오류', '프로필 저장 중 문제가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>프로필 설정</Text>
      <Text style={styles.subtitle}>MajorMate에서 사용할 정보를 입력해주세요</Text>

      <View style={styles.field}>
        <Text style={styles.label}>닉네임 *</Text>
        <TextInput
          style={styles.input}
          placeholder="2~20자 입력"
          value={nickname}
          onChangeText={setNickname}
          maxLength={20}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>전공</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 컴퓨터공학"
          value={major}
          onChangeText={setMajor}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>국적 (ISO 코드)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: KR, US, JP"
          value={nationality}
          onChangeText={setNationality}
          maxLength={2}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.genderChip, gender === g.value && styles.genderChipSelected]}
              onPress={() => setGender(g.value)}
            >
              <Text style={[styles.genderChipText, gender === g.value && styles.genderChipTextSelected]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>다음 — 캐릭터 설정</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F0FF',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5B2EE0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0D9FF',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  genderChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0D9FF',
  },
  genderChipSelected: {
    backgroundColor: '#5B2EE0',
    borderColor: '#5B2EE0',
  },
  genderChipText: {
    fontSize: 13,
    color: '#555',
  },
  genderChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#5B2EE0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

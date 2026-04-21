import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CharacterRenderer, { CharacterGender, CharacterLayers, LayerKey } from '../components/CharacterRenderer';
import { API_BASE_URL } from '../constants/api';

const LAYER_ORDER: LayerKey[] = ['bottom', 'top', 'shoes', 'hair', 'bag', 'glasses', 'item'];

const LAYER_LABELS: Record<LayerKey, string> = {
  bottom: '하의',
  top: '상의',
  shoes: '신발',
  hair: '헤어',
  bag: '가방',
  glasses: '안경',
  item: '아이템',
};

const ITEM_COUNT = 8;

function options(prefix: string): string[] {
  return Array.from({ length: ITEM_COUNT }, (_, i) => `${prefix}_${String(i + 1).padStart(2, '0')}`);
}

const LAYER_OPTIONS: Record<LayerKey, string[]> = {
  bottom:  options('bottom'),
  top:     options('top'),
  shoes:   options('shoes'),
  hair:    options('hair'),
  bag:     options('bag'),
  glasses: options('glasses'),
  item:    options('item'),
};

const GENDERS: { label: string; value: CharacterGender }[] = [
  { label: '남성', value: 'male' },
  { label: '여성', value: 'female' },
];

export default function CharacterSetupScreen() {
  const router = useRouter();
  const [layers, setLayers] = useState<CharacterLayers>({ gender: 'male' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/me/character`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: CharacterLayers) => setLayers(data))
      .catch(() => {});
  }, []);

  const handleGender = (g: CharacterGender) =>
    setLayers((prev) => ({ ...prev, gender: g }));

  const handleSelect = (layer: LayerKey, value: string) =>
    setLayers((prev) => ({
      ...prev,
      [layer]: prev[layer] === value ? null : value,
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/character`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(layers),
      });
      if (!res.ok) throw new Error();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('오류', '캐릭터 저장 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>캐릭터 설정</Text>
      <Text style={styles.subtitle}>나만의 픽셀 아트 캐릭터를 꾸며보세요</Text>

      {/* Preview */}
      <View style={styles.previewBox}>
        <CharacterRenderer layers={layers} size={180} />
      </View>

      {/* Gender selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>성별</Text>
        <View style={styles.row}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.chip, layers.gender === g.value && styles.chipSelected]}
              onPress={() => handleGender(g.value)}
            >
              <Text style={[styles.chipText, layers.gender === g.value && styles.chipTextSelected]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Layer selectors */}
      {LAYER_ORDER.map((layerKey) => (
        <View key={layerKey} style={styles.section}>
          <Text style={styles.sectionLabel}>{LAYER_LABELS[layerKey]}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {/* 없음 chip */}
              <TouchableOpacity
                style={[styles.chip, !layers[layerKey] && styles.chipSelected]}
                onPress={() => setLayers((prev) => ({ ...prev, [layerKey]: null }))}
              >
                <Text style={[styles.chipText, !layers[layerKey] && styles.chipTextSelected]}>없음</Text>
              </TouchableOpacity>
              {LAYER_OPTIONS[layerKey].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, layers[layerKey] === opt && styles.chipSelected]}
                  onPress={() => handleSelect(layerKey, opt)}
                >
                  <Text style={[styles.chipText, layers[layerKey] === opt && styles.chipTextSelected]}>
                    {opt.split('_')[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? '저장 중...' : '완료 — 공부 시작하기'}</Text>
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
    marginBottom: 24,
  },
  previewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#5B2EE0',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0D9FF',
  },
  chipSelected: {
    backgroundColor: '#5B2EE0',
    borderColor: '#5B2EE0',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#5B2EE0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

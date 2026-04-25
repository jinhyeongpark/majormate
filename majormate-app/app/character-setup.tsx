import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CharacterRenderer, { CharacterGender, CharacterLayers, LayerKey } from '../components/CharacterRenderer';
import { API_BASE_URL } from '../constants/api';

interface CharacterItem {
  id: string;
  category: string;
  name: string;
  price: number;
  filePath: string;
}

type ItemsByLayer = Record<LayerKey, CharacterItem[]>;

const LAYER_ORDER: LayerKey[] = ['hair', 'top', 'bottom', 'shoes'];

const LAYER_LABELS: Record<LayerKey, string> = {
  bottom: 'BOTTOM',
  top: 'TOP',
  shoes: 'SHOES',
  hair: 'HAIR',
  bag: 'BAG',
  glasses: 'GLASSES',
  item: 'ITEM',
};

const GENDERS: { label: string; value: CharacterGender }[] = [
  { label: 'MALE', value: 'male' },
  { label: 'FEMALE', value: 'female' },
];

const EMPTY_ITEMS: ItemsByLayer = {
  bottom: [], top: [], shoes: [], hair: [], bag: [], glasses: [], item: [],
};

export default function CharacterSetupScreen() {
  const router = useRouter();
  const [layers, setLayers] = useState<CharacterLayers>({ gender: 'male' });
  const [itemsByLayer, setItemsByLayer] = useState<ItemsByLayer>(EMPTY_ITEMS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/me/character`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setLayers(data))
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/items`, { credentials: 'include' })
      .then((r) => r.json())
      .then((items: CharacterItem[]) => {
        const grouped: ItemsByLayer = { ...EMPTY_ITEMS };
        for (const item of items) {
          const key = item.category.toLowerCase() as LayerKey;
          if (key in grouped) grouped[key].push(item);
        }
        setItemsByLayer(grouped);
      })
      .catch(() => {});
  }, []);

  const handleGender = (g: CharacterGender) =>
    setLayers((prev) => ({ ...prev, gender: g }));

  const handleSelect = (layer: LayerKey, url: string) =>
    setLayers((prev) => ({
      ...prev,
      [layer]: prev[layer] === url ? null : url,
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
    } catch {
      // 백엔드 미연동 시에도 UI 플로우 진행
    } finally {
      setSaving(false);
    }
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CHARACTER</Text>
      <Text style={styles.subtitle}>캐릭터를 꾸며보세요</Text>

      <View style={styles.previewBox}>
        <CharacterRenderer layers={layers} size={180} />
      </View>

      {/* Gender */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>GENDER</Text>
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
              <TouchableOpacity
                style={[styles.chip, !layers[layerKey] && styles.chipSelected]}
                onPress={() => setLayers((prev) => ({ ...prev, [layerKey]: null }))}
              >
                <Text style={[styles.chipText, !layers[layerKey] && styles.chipTextSelected]}>NONE</Text>
              </TouchableOpacity>
              {itemsByLayer[layerKey].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemChip, layers[layerKey] === item.filePath && styles.chipSelected]}
                  onPress={() => handleSelect(layerKey, item.filePath)}
                >
                  <Image
                    source={{ uri: item.filePath }}
                    style={styles.itemThumbnail}
                    resizeMode="contain"
                  />
                  <Text style={[styles.itemName, layers[layerKey] === item.filePath && styles.chipTextSelected]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.5 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'SAVING...' : 'START >'}</Text>
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
    marginBottom: 28,
  },
  previewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#888',
    marginBottom: 10,
    letterSpacing: 1,
  },
  row: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#2B3580',
    borderColor: '#4FC3F7',
  },
  chipText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#555',
  },
  chipTextSelected: {
    color: '#4FC3F7',
  },
  itemChip: {
    width: 72,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    gap: 4,
  },
  itemThumbnail: {
    width: 48,
    height: 48,
  },
  itemName: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    color: '#555',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2B3580',
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomColor: '#1a2160',
    borderRightColor: '#1a2160',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#4d5fa8',
    borderLeftColor: '#4d5fa8',
  },
  saveButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 3,
  },
});

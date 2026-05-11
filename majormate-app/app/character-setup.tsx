import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CharacterRenderer, { CharacterGender, CharacterLayers, LayerKey } from '../components/CharacterRenderer';
import PurchaseConfirmModal from '../components/PurchaseConfirmModal';
import TopUpModal from '../components/TopUpModal';
import { apiClient } from '../src/api/client';
import { fetchOwnedItems, fetchPoints, fetchShopItems, ShopItem } from '../src/api/shop';

type ItemsByLayer = Record<LayerKey, ShopItem[]>;

const LAYER_ORDER: LayerKey[] = ['hair', 'top', 'bottom', 'shoes', 'bag', 'glasses', 'item'];

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
  const [balance, setBalance] = useState(0);
  const [topUpVisible, setTopUpVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    apiClient.get<CharacterLayers>('/api/users/me/character')
      .then((r) => setLayers(r.data))
      .catch(() => {});

    fetchPoints()
      .then(setBalance)
      .catch(() => {});

    Promise.all([fetchShopItems(), fetchOwnedItems()])
      .then(([shopItems, ownedItems]) => {
        const ownedIds = new Set(ownedItems.map((o) => o.itemId));
        const merged = shopItems.map((item) => ({
          ...item,
          owned: item.owned || ownedIds.has(item.id),
        }));
        const grouped: ItemsByLayer = { ...EMPTY_ITEMS };
        for (const item of merged) {
          const key = item.category.toLowerCase() as LayerKey;
          if (key in grouped) grouped[key].push(item);
        }
        setItemsByLayer(grouped);
      })
      .catch(() => {});
  }, []);

  const handleGender = (g: CharacterGender) =>
    setLayers((prev) => ({ ...prev, gender: g }));

  const handleItemPress = (layer: LayerKey, item: ShopItem) => {
    if (item.owned) {
      // 보유 아이템 → 바로 장착 (토글)
      setLayers((prev) => ({
        ...prev,
        [layer]: prev[layer] === item.filePath ? null : item.filePath,
      }));
    } else {
      // 미보유 아이템 → 구매 확인 모달
      setSelectedItem(item);
    }
  };

  const handlePurchased = (
    newBalance: number,
    equippedCharacter: CharacterLayers,
    itemId: string,
  ) => {
    setBalance(newBalance);
    setLayers(equippedCharacter);
    // 로컬 상태에서 owned 즉시 반영
    setItemsByLayer((prev) => {
      const next = { ...prev };
      for (const key of LAYER_ORDER) {
        next[key] = prev[key].map((item) =>
          item.id === itemId ? { ...item, owned: true } : item,
        );
      }
      return next;
    });
    setSelectedItem(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/users/me/character', layers);
    } catch {
      Alert.alert('저장 실패', '캐릭터 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
    router.replace('/(tabs)');
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with points */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>CHARACTER</Text>
            <Text style={styles.subtitle}>캐릭터를 꾸며보세요</Text>
          </View>
          <View style={styles.pointsArea}>
            <Text style={styles.pointsValue}>
              {'💎'} {balance.toLocaleString()} P
            </Text>
            <TouchableOpacity style={styles.chargeBtn} onPress={() => setTopUpVisible(true)}>
              <Text style={styles.chargeBtnText}>충전</Text>
            </TouchableOpacity>
          </View>
        </View>

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
                    style={[
                      styles.itemChip,
                      layers[layerKey] === item.filePath && styles.chipSelected,
                      !item.owned && styles.itemChipLocked,
                    ]}
                    onPress={() => handleItemPress(layerKey, item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.itemThumbnailWrapper}>
                      <Image
                        source={{ uri: item.filePath }}
                        style={[styles.itemThumbnail, !item.owned && styles.itemThumbnailLocked]}
                        resizeMode="contain"
                      />
                      {!item.owned && (
                        <View style={styles.lockOverlay}>
                          <Text style={styles.lockIcon}>{'D🔒'[1]}</Text>
                        </View>
                      )}
                      {item.owned && layers[layerKey] === item.filePath && (
                        <View style={styles.equippedOverlay}>
                          <Text style={styles.equippedIcon}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.itemName,
                        layers[layerKey] === item.filePath && styles.chipTextSelected,
                        !item.owned && styles.itemNameLocked,
                      ]}
                      numberOfLines={1}
                    >
                      {item.owned ? item.name : `${item.price}P`}
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

      <TopUpModal
        visible={topUpVisible}
        onClose={() => setTopUpVisible(false)}
        onCharged={(newBalance) => setBalance(newBalance)}
      />

      <PurchaseConfirmModal
        item={selectedItem}
        balance={balance}
        onClose={() => setSelectedItem(null)}
        onPurchased={handlePurchased}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#111111',
    padding: 24,
    paddingTop: 64,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
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
  },
  pointsArea: {
    alignItems: 'flex-end',
    gap: 8,
  },
  pointsValue: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#B8FF00',
  },
  chargeBtn: {
    backgroundColor: '#2B4000',
    borderWidth: 1,
    borderColor: '#B8FF00',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chargeBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#B8FF00',
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
  itemChipLocked: {
    borderColor: '#1A1A1A',
  },
  itemThumbnailWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  itemThumbnail: {
    width: 48,
    height: 48,
  },
  itemThumbnailLocked: {
    opacity: 0.35,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 18,
  },
  equippedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2B3580',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedIcon: {
    fontSize: 10,
    color: '#4FC3F7',
    lineHeight: 14,
  },
  itemName: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    color: '#555',
    textAlign: 'center',
  },
  itemNameLocked: {
    color: '#B8FF00',
    fontSize: 6,
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

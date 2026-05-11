import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { purchaseItem, ShopItem } from '../src/api/shop';
import { CharacterLayers } from './CharacterRenderer';

interface PurchaseConfirmModalProps {
  item: ShopItem | null;
  balance: number;
  onClose: () => void;
  onPurchased: (newBalance: number, equippedCharacter: CharacterLayers, itemId: string) => void;
}

export default function PurchaseConfirmModal({
  item,
  balance,
  onClose,
  onPurchased,
}: PurchaseConfirmModalProps) {
  if (!item) return null;

  const canAfford = balance >= item.price;

  const handlePurchase = async () => {
    if (!canAfford) {
      Alert.alert('포인트 부족', '포인트가 부족합니다.\n충전 후 다시 시도해주세요.');
      return;
    }
    try {
      const res = await purchaseItem(item.id);
      onPurchased(res.balance, res.equippedCharacter, item.id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '';
      if (message.includes('이미 보유')) {
        Alert.alert('알림', '이미 보유한 아이템입니다.');
      } else if (message.includes('포인트')) {
        Alert.alert('포인트 부족', '포인트가 부족합니다.\n충전 후 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '구매에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <Modal visible={!!item} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>PURCHASE</Text>

          <Image source={{ uri: item.filePath }} style={styles.itemImage} resizeMode="contain" />

          <Text style={styles.itemName}>{item.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>가격</Text>
            <Text style={styles.price}>{item.price.toLocaleString()} P</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>보유 포인트</Text>
            <Text style={[styles.balance, !canAfford && styles.balanceInsufficient]}>
              {balance.toLocaleString()} P
            </Text>
          </View>

          {!canAfford && (
            <Text style={styles.insufficientNote}>포인트가 부족합니다</Text>
          )}

          <TouchableOpacity
            style={[styles.purchaseBtn, !canAfford && styles.purchaseBtnDisabled]}
            activeOpacity={0.8}
            onPress={handlePurchase}
          >
            <View style={[styles.purchaseShadow, !canAfford && styles.purchaseShadowDisabled]}>
              <View style={[styles.purchaseInner, !canAfford && styles.purchaseInnerDisabled]}>
                <Text style={styles.purchaseBtnText}>BUY</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333',
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: 280,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 12,
    color: '#B8FF00',
  },
  itemImage: {
    width: 96,
    height: 96,
  },
  itemName: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#fff',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  priceLabel: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#666',
  },
  price: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#B8FF00',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  balanceLabel: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#666',
  },
  balance: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#4FC3F7',
  },
  balanceInsufficient: {
    color: '#E05252',
  },
  insufficientNote: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    color: '#E05252',
  },
  purchaseBtn: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  purchaseBtnDisabled: {
    opacity: 0.4,
  },
  purchaseShadow: {
    backgroundColor: '#527000',
    paddingRight: 4,
    paddingBottom: 4,
  },
  purchaseShadowDisabled: {
    backgroundColor: '#333',
  },
  purchaseInner: {
    backgroundColor: '#B8FF00',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseInnerDisabled: {
    backgroundColor: '#444',
  },
  purchaseBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#0D1800',
  },
  closeBtn: {
    paddingVertical: 8,
  },
  closeBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#555',
    letterSpacing: 1,
  },
});

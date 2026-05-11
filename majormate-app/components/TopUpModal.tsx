import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { iapWebhook } from '../src/api/shop';
import { apiClient } from '../src/api/client';

interface TopUpPackage {
  productId: string;
  price: string;
  points: number;
  bonus?: string;
}

const PACKAGES: TopUpPackage[] = [
  { productId: 'points_1000',  price: '1,000원',  points: 1000 },
  { productId: 'points_5000',  price: '5,000원',  points: 5500, bonus: '10% 보너스' },
  { productId: 'points_10000', price: '10,000원', points: 12000, bonus: '20% 보너스' },
];

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  onCharged: (newBalance: number) => void;
}

export default function TopUpModal({ visible, onClose, onCharged }: TopUpModalProps) {
  const handleSelect = async (pkg: TopUpPackage) => {
    Alert.alert(
      '인앱 결제',
      '인앱 결제가 준비 중입니다.\n테스트용으로 포인트를 충전합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '충전',
          onPress: async () => {
            try {
              const meRes = await apiClient.get<{ id: string }>('/api/users/me');
              const userId = meRes.data.id;
              const newBalance = await iapWebhook({
                platform: 'ANDROID',
                productId: pkg.productId,
                receiptData: 'test',
                userId,
              });
              onCharged(newBalance);
              onClose();
            } catch {
              Alert.alert('오류', '충전에 실패했습니다. 다시 시도해주세요.');
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>CHARGE P</Text>
          <Text style={styles.subtitle}>포인트 충전</Text>

          {PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.productId}
              style={styles.packageCard}
              activeOpacity={0.8}
              onPress={() => handleSelect(pkg)}
            >
              <View style={styles.packageInner}>
                <View style={styles.packageLeft}>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                  {pkg.bonus && (
                    <View style={styles.bonusBadge}>
                      <Text style={styles.bonusText}>{pkg.bonus}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.packageRight}>
                  <Text style={styles.packagePoints}>
                    {pkg.points.toLocaleString()} P
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>CLOSE</Text>
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
    width: 300,
    gap: 14,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#B8FF00',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#555',
    textAlign: 'center',
    marginTop: -6,
    marginBottom: 4,
  },
  packageCard: {
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: '#333',
  },
  packageInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  packageLeft: {
    gap: 6,
  },
  packagePrice: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#aaa',
  },
  bonusBadge: {
    backgroundColor: '#2B4000',
    borderWidth: 1,
    borderColor: '#B8FF00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  bonusText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    color: '#B8FF00',
  },
  packageRight: {},
  packagePoints: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 11,
    color: '#B8FF00',
  },
  closeBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  closeBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#555',
    letterSpacing: 1,
  },
});

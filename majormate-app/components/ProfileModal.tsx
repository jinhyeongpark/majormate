import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  nickname: string | null;
  major: string | null;
}

export default function ProfileModal({ visible, onClose, onLogout, nickname, major }: ProfileModalProps) {
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <View style={styles.container}>
        <Text style={styles.nickname}>{nickname ?? '---'}</Text>
        <Text style={styles.tags}>{`#${major ?? '???'}`}</Text>
        <View style={styles.divider} />
        <TouchableOpacity onPress={onLogout} activeOpacity={0.8} style={styles.logoutTouch}>
          <View style={styles.logoutShadow}>
            <View style={styles.logoutBtn}>
              <Text style={styles.logoutText}>LOGOUT</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeTouch}>
          <Text style={styles.closeText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333',
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: 280,
    gap: 12,
  },
  nickname: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1,
  },
  tags: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#666',
    letterSpacing: 1,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  logoutShadow: {
    backgroundColor: '#8C1818',
    paddingRight: 4,
    paddingBottom: 4,
  },
  logoutBtn: {
    backgroundColor: '#E05252',
    height: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#1A0000',
  },
  logoutTouch: {
    alignSelf: 'stretch',
  },
  closeTouch: {
    marginTop: 4,
    paddingVertical: 10,
  },
  closeText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#555',
    letterSpacing: 1,
  },
});

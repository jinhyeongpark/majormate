import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FriendResponse, fetchFriends } from '../src/api/friends';
import { createCustomRoom } from '../src/api/rooms';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateRoomModal({ visible, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName('');
    setSelectedIds(new Set());
    setLoadingFriends(true);
    fetchFriends()
      .then(setFriends)
      .catch((e) => console.log('친구 목록 조회 실패', e))
      .finally(() => setLoadingFriends(false));
  }, [visible]);

  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createCustomRoom({ name: name.trim(), inviteeUserIds: Array.from(selectedIds) });
      onCreated();
      onClose();
    } catch (e) {
      console.log('방 생성 실패', e);
    } finally {
      setCreating(false);
    }
  };

  const selectedFriends = friends.filter((f) => selectedIds.has(f.userId));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>NEW ROOM</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <View style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>X</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Room name input */}
          <Text style={styles.label}>ROOM NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="방 이름 입력"
            placeholderTextColor="#555"
            maxLength={30}
          />

          {/* Selected chips */}
          {selectedFriends.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
              contentContainerStyle={{ gap: 6 }}
            >
              {selectedFriends.map((f) => (
                <TouchableOpacity key={f.userId} style={styles.chip} onPress={() => toggleSelect(f.userId)}>
                  <Text style={styles.chipText}>{f.nickname} ×</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Friend list */}
          <Text style={[styles.label, { marginTop: 16 }]}>INVITE FRIENDS</Text>
          {loadingFriends ? (
            <ActivityIndicator color="#B8FF00" style={{ marginTop: 12 }} />
          ) : friends.length === 0 ? (
            <Text style={styles.noFriends}>친구가 없습니다</Text>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(f) => f.userId}
              style={styles.friendList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = selectedIds.has(item.userId);
                return (
                  <TouchableOpacity
                    style={[styles.friendRow, selected && styles.friendRowSelected]}
                    onPress={() => toggleSelect(item.userId)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.friendNick}>{item.nickname}</Text>
                      <Text style={styles.friendMajor}>{item.major}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Create button */}
          <TouchableOpacity
            style={[styles.createBtn, (!name.trim() || creating) && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!name.trim() || creating}
            activeOpacity={0.8}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#0D1800" />
            ) : (
              <Text style={styles.createBtnText}>만들기</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#B8FF00',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#aaa',
    lineHeight: 12,
  },
  label: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#555',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  chipRow: {
    marginTop: 10,
    maxHeight: 36,
  },
  chip: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#B8FF00',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#B8FF00',
  },
  noFriends: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  friendList: {
    maxHeight: 200,
    marginBottom: 4,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    gap: 12,
  },
  friendRowSelected: {
    backgroundColor: '#1E2A10',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#B8FF00',
    backgroundColor: '#B8FF00',
  },
  checkmark: {
    fontSize: 12,
    color: '#0D1800',
    lineHeight: 14,
  },
  friendNick: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  friendMajor: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: '#B8FF00',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  createBtnDisabled: {
    backgroundColor: '#3A4A20',
  },
  createBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#0D1800',
  },
});

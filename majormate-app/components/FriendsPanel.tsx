import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FriendResponse,
  addFriend,
  fetchFriends,
  fetchMyFriendCode,
} from '../src/api/friends';

export default function FriendsPanel() {
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [myCode, setMyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([fetchFriends(), fetchMyFriendCode()])
      .then(([list, codeRes]) => {
        setFriends(list);
        setMyCode(codeRes.friendCode);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    setAdding(true);
    try {
      const newFriend = await addFriend(code);
      setFriends((prev) => [newFriend, ...prev]);
      setInputCode('');
    } catch (e: unknown) {
      Alert.alert('오류', e instanceof Error ? e.message : '친구 추가 실패');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.panel}>
      {/* My friend code */}
      <View style={styles.myCodeRow}>
        <Text style={styles.myCodeLabel}>내 코드</Text>
        <Text style={styles.myCode}>{myCode || '—'}</Text>
      </View>

      {/* Add friend input */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="친구 코드 입력"
          placeholderTextColor="#888"
          value={inputCode}
          onChangeText={setInputCode}
          autoCapitalize="characters"
          maxLength={8}
        />
        <TouchableOpacity
          style={[styles.addButton, adding && { opacity: 0.6 }]}
          onPress={handleAdd}
          disabled={adding}
        >
          <Text style={styles.addButtonText}>{adding ? '...' : '추가'}</Text>
        </TouchableOpacity>
      </View>

      {/* Friend list */}
      {loading ? (
        <ActivityIndicator color="#4FC3F7" style={{ marginTop: 24 }} />
      ) : friends.length === 0 ? (
        <Text style={styles.empty}>아직 친구가 없습니다</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => <FriendItem friend={item} />}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}
    </View>
  );
}

function FriendItem({ friend }: { friend: FriendResponse }) {
  const studying = friend.status === 'STUDYING';
  return (
    <View style={styles.friendRow}>
      <View style={[styles.statusDot, studying ? styles.dotStudying : styles.dotOffline]} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.nickname}</Text>
        <Text style={styles.friendMeta}>
          {friend.major}
          {studying && friend.studyKeyword ? `  ·  # ${friend.studyKeyword}` : ''}
        </Text>
      </View>
      <Text style={[styles.statusLabel, studying ? styles.labelStudying : styles.labelOffline]}>
        {studying ? 'STUDYING' : 'OFFLINE'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  myCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  myCodeLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  myCode: {
    color: '#4FC3F7',
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: 'PressStart2P_400Regular',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  addButton: {
    backgroundColor: '#5B2EE0',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  empty: {
    color: '#555',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 13,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotStudying: {
    backgroundColor: '#4FC3F7',
  },
  dotOffline: {
    backgroundColor: '#444',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  friendMeta: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelStudying: {
    color: '#4FC3F7',
  },
  labelOffline: {
    color: '#444',
  },
});

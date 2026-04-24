import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RoomDetail, RoomMember, RoomSummary, fetchRoom, leaveRoom } from '../src/api/rooms';

interface Props {
  room: RoomSummary;
  onLeave: () => void;
}

function computeElapsedMs(member: RoomMember): number {
  if (member.status === 'STUDYING' && member.currentStartTimeEpoch) {
    return member.accumulatedMs + Date.now() - member.currentStartTimeEpoch;
  }
  return member.accumulatedMs;
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const ss = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function RoomView({ room, onLeave }: Props) {
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    fetchRoom(room.id)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [room.id]);

  useEffect(() => {
    load();
    const pollId = setInterval(load, 30_000);
    return () => clearInterval(pollId);
  }, [load]);

  // Tick every second to update locally-computed elapsed times
  useEffect(() => {
    const tickId = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(tickId);
  }, []);

  const handleLeave = async () => {
    await leaveRoom(room.id).catch(() => {});
    onLeave();
  };

  const members = detail?.members ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomMeta}>
            {room.major}  ·  {members.length}/{room.maxMembers}명
          </Text>
        </View>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveButton} activeOpacity={0.7}>
          <Text style={styles.leaveText}>나가기</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#4FC3F7" style={{ marginTop: 32 }} />
      ) : members.length === 0 ? (
        <Text style={styles.empty}>아직 멤버가 없습니다</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => m.userId}
          numColumns={3}
          renderItem={({ item }) => <MemberCard member={item} />}
          showsVerticalScrollIndicator={false}
          extraData={tick}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

function MemberCard({ member }: { member: RoomMember }) {
  const studying = member.status === 'STUDYING';
  const paused = member.status === 'PAUSED';
  const active = studying || paused;
  const elapsed = computeElapsedMs(member);

  const dotColor = studying ? '#4FC3F7' : paused ? '#F4A261' : '#3A3A3A';
  const timerColor = paused ? '#F4A261' : '#fff';

  return (
    <View style={styles.card}>
      <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
      <Text style={styles.nickname} numberOfLines={1}>{member.nickname}</Text>
      {active ? (
        <Text style={[styles.timer, { color: timerColor }]}>{formatMs(elapsed)}</Text>
      ) : (
        <Text style={styles.offlineLabel}>OFFLINE</Text>
      )}
      {member.keyword ? (
        <Text style={styles.keyword} numberOfLines={1}>#{member.keyword}</Text>
      ) : (
        <Text style={styles.keywordPlaceholder}>—</Text>
      )}
      {member.allowQuestion && <Text style={styles.qIcon}>💬</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  roomName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  roomMeta: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  leaveText: {
    color: '#888',
    fontSize: 12,
  },
  empty: {
    color: '#555',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 13,
  },
  grid: {
    paddingBottom: 8,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#242424',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    minHeight: 100,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginBottom: 2,
  },
  nickname: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  timer: {
    fontSize: 10,
    fontFamily: 'PressStart2P_400Regular',
    letterSpacing: 0.5,
  },
  offlineLabel: {
    color: '#3A3A3A',
    fontSize: 8,
    fontFamily: 'PressStart2P_400Regular',
  },
  keyword: {
    color: '#4FC3F7',
    fontSize: 8,
    fontFamily: 'PressStart2P_400Regular',
    textAlign: 'center',
  },
  keywordPlaceholder: {
    color: '#333',
    fontSize: 10,
  },
  qIcon: {
    fontSize: 10,
    marginTop: 2,
  },
});

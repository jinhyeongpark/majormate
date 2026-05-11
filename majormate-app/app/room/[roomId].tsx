import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import CharacterRenderer, { CharacterLayers } from '../../components/CharacterRenderer';
import { fetchUserCharacter } from '../../src/api/users';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoomDetail, RoomMember, fetchRoom, leaveRoom } from '../../src/api/rooms';
import { sendQaRequest } from '../../src/api/qa';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 16;
const CARD_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP * 2) / 3;

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

function statusColor(status: string): string {
  if (status === 'STUDYING') return '#4FC3F7';
  if (status === 'PAUSED') return '#F4A261';
  return '#2A2A2A';
}

interface MemberCardProps {
  member: RoomMember;
  onAskQuestion: (member: RoomMember) => void;
  character?: CharacterLayers;
}

function MemberCard({ member, onAskQuestion, character }: MemberCardProps) {
  const elapsed = computeElapsedMs(member);
  const offline = member.status === 'OFFLINE';
  const borderColor = statusColor(member.status);
  const timeColor =
    member.status === 'STUDYING' ? '#4FC3F7' :
    member.status === 'PAUSED' ? '#F4A261' :
    '#3A3A3A';

  return (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      <Text style={[styles.cardTime, { color: timeColor }]}>
        {offline ? '--:--' : formatMs(elapsed)}
      </Text>
      {character ? (
        <CharacterRenderer layers={character} size={80} />
      ) : (
        <View style={[styles.avatar, { borderColor }]}>
          <Text style={styles.avatarText}>
            {member.nickname.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.cardNickname} numberOfLines={1}>
        {member.nickname}
      </Text>
      {member.keyword ? (
        <Text style={styles.cardKeyword} numberOfLines={1}>
          #{member.keyword}
        </Text>
      ) : null}
      {member.allowQuestion && (
        <TouchableOpacity onPress={() => onAskQuestion(member)} hitSlop={8} activeOpacity={0.6}>
          <Text style={styles.qIcon}>💬</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function RoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [askTarget, setAskTarget] = useState<RoomMember | null>(null);
  const [askMessage, setAskMessage] = useState('');
  const [sending, setSending] = useState(false);
  const characterCache = useRef<Map<string, CharacterLayers>>(new Map());
  const [characters, setCharacters] = useState<Map<string, CharacterLayers>>(new Map());

  const load = useCallback(() => {
    if (!roomId) return;
    fetchRoom(roomId)
      .then((d) => {
        setDetail(d);
        const missing = d.members.filter((m) => !characterCache.current.has(m.userId));
        if (missing.length === 0) return;
        Promise.all(
          missing.map((m) =>
            fetchUserCharacter(m.userId)
              .then((c) => ({ userId: m.userId, character: c }))
              .catch(() => null)
          )
        ).then((results) => {
          results.forEach((r) => {
            if (r) characterCache.current.set(r.userId, r.character);
          });
          setCharacters(new Map(characterCache.current));
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    load();
    const pollId = setInterval(load, 5_000);
    return () => clearInterval(pollId);
  }, [load]);

  useEffect(() => {
    const tickId = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(tickId);
  }, []);

  const handleLeave = async () => {
    if (!roomId) return;
    await leaveRoom(roomId).catch(() => {});
    router.back();
  };

  const handleAskQuestion = (member: RoomMember) => {
    setAskTarget(member);
    setAskMessage('');
  };

  const handleSendQuestion = async () => {
    if (!askTarget) return;
    setSending(true);
    try {
      await sendQaRequest(askTarget.userId, askMessage.trim() || undefined);
      setAskTarget(null);
      setAskMessage('');
    } catch {
      // 전송 실패 시 모달 유지
    } finally {
      setSending(false);
    }
  };

  const handleCancelAsk = () => {
    setAskTarget(null);
    setAskMessage('');
  };

  const members = detail?.members ?? [];
  const isMajorRoom = detail?.type === 'MAJOR';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} activeOpacity={0.7}>
          <Text style={styles.backBtn}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.roomName} numberOfLines={1}>
          {detail?.name ?? ''}
        </Text>
        {isMajorRoom ? (
          <View style={styles.headerRight} />
        ) : (
          <TouchableOpacity onPress={handleLeave} style={styles.leaveButton} activeOpacity={0.7}>
            <Text style={styles.leaveText}>LEAVE</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Member grid */}
      {loading ? (
        <ActivityIndicator color="#4FC3F7" style={{ marginTop: 32 }} />
      ) : members.length === 0 ? (
        <Text style={styles.empty}>NO MEMBERS</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => m.userId}
          numColumns={3}
          renderItem={({ item }) => (
            <MemberCard
              member={item}
              onAskQuestion={handleAskQuestion}
              character={characters.get(item.userId)}
            />
          )}
          showsVerticalScrollIndicator={false}
          extraData={[tick, characters]}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
        />
      )}

      {/* Q&A 모달 */}
      <Modal
        visible={askTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCancelAsk}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>질문 요청</Text>
            <Text style={styles.modalTarget}>
              {askTarget?.nickname}에게 질문을 보냅니다
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="메시지 (선택, 최대 500자)"
              placeholderTextColor="#555"
              value={askMessage}
              onChangeText={setAskMessage}
              maxLength={500}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={handleCancelAsk}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSend, sending && styles.modalBtnDisabled]}
                onPress={handleSendQuestion}
                activeOpacity={0.7}
                disabled={sending}
              >
                <Text style={styles.modalBtnText}>{sending ? '전송 중...' : '보내기'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backBtn: {
    color: '#4FC3F7',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    marginRight: 12,
  },
  roomName: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerRight: {
    width: 56,
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
    fontSize: 8,
    fontFamily: 'PressStart2P_400Regular',
  },
  grid: {
    padding: CARD_PADDING,
    paddingTop: 16,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    minHeight: 150,
  },
  cardTime: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cardNickname: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardKeyword: {
    color: '#4FC3F7',
    fontSize: 8,
    fontFamily: 'PressStart2P_400Regular',
    textAlign: 'center',
  },
  qIcon: {
    fontSize: 10,
    marginTop: 2,
  },
  empty: {
    color: '#555',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 8,
    fontFamily: 'PressStart2P_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalTitle: {
    color: '#4FC3F7',
    fontSize: 10,
    fontFamily: 'PressStart2P_400Regular',
    marginBottom: 8,
  },
  modalTarget: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#2A2A2A',
  },
  modalBtnSend: {
    backgroundColor: '#4FC3F7',
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

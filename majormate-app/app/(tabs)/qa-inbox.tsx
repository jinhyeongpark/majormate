import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QaRequestResponse, acceptQaRequest, rejectQaRequest } from '../../src/api/qa';

const PENDING_QA_KEY = '@pending_qa_requests';

export async function appendPendingQaRequest(req: QaRequestResponse): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_QA_KEY);
    const list: QaRequestResponse[] = raw ? JSON.parse(raw) : [];
    const exists = list.some((r) => r.id === req.id);
    if (!exists) {
      list.unshift(req);
      await AsyncStorage.setItem(PENDING_QA_KEY, JSON.stringify(list));
    }
  } catch {
    // 저장 실패는 무시
  }
}

async function loadPendingRequests(): Promise<QaRequestResponse[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_QA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function removePendingRequest(requestId: string): Promise<void> {
  try {
    const list = await loadPendingRequests();
    const updated = list.filter((r) => r.id !== requestId);
    await AsyncStorage.setItem(PENDING_QA_KEY, JSON.stringify(updated));
  } catch {
    // 무시
  }
}

export default function QaInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [requests, setRequests] = useState<QaRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await loadPendingRequests();
    // PENDING 상태인 것만 표시
    setRequests(list.filter((r) => r.status === 'PENDING'));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAccept = async (req: QaRequestResponse) => {
    setProcessingId(req.id);
    try {
      const updated = await acceptQaRequest(req.id);
      await removePendingRequest(req.id);
      await refresh();
      if (updated.chatRoomId) {
        router.push(`/qa/chat/${updated.chatRoomId}`);
      }
    } catch {
      // 실패 시 목록 유지
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: QaRequestResponse) => {
    setProcessingId(req.id);
    try {
      await rejectQaRequest(req.id);
      await removePendingRequest(req.id);
      await refresh();
    } catch {
      // 실패 시 목록 유지
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>CHAT ROOMS</Text>

      {loading ? (
        <ActivityIndicator color="#4FC3F7" style={{ marginTop: 40 }} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>NO PENDING REQUESTS</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              processing={processingId === item.id}
              onAccept={() => handleAccept(item)}
              onReject={() => handleReject(item)}
            />
          )}
        />
      )}
    </View>
  );
}

interface RequestCardProps {
  request: QaRequestResponse;
  processing: boolean;
  onAccept: () => void;
  onReject: () => void;
}

function RequestCard({ request, processing, onAccept, onReject }: RequestCardProps) {
  const date = new Date(request.createdAt).toLocaleString();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.senderName}>{request.requesterNickname}</Text>
        <Text style={styles.cardDate}>{date}</Text>
      </View>
      {request.message ? (
        <Text style={styles.cardMessage}>{request.message}</Text>
      ) : (
        <Text style={styles.cardNoMessage}>메시지 없음</Text>
      )}
      <View style={styles.cardButtons}>
        <TouchableOpacity
          style={[styles.cardBtn, styles.cardBtnReject, processing && styles.cardBtnDisabled]}
          onPress={onReject}
          disabled={processing}
          activeOpacity={0.7}
        >
          <Text style={styles.cardBtnText}>거절</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardBtn, styles.cardBtnAccept, processing && styles.cardBtnDisabled]}
          onPress={onAccept}
          disabled={processing}
          activeOpacity={0.7}
        >
          <Text style={styles.cardBtnText}>{processing ? '처리 중...' : '수락'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#4FC3F7',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#444',
  },
  list: {
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardDate: {
    color: '#555',
    fontSize: 11,
  },
  cardMessage: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardNoMessage: {
    color: '#444',
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cardBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardBtnAccept: {
    backgroundColor: '#4FC3F7',
  },
  cardBtnReject: {
    backgroundColor: '#2A2A2A',
  },
  cardBtnDisabled: {
    opacity: 0.5,
  },
  cardBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

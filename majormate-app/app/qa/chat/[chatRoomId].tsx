import { Client } from '@stomp/stompjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessageResponse, fetchChatHistory } from '../../../src/api/qa';
import { tokenStorage } from '../../../src/auth/tokenStorage';
import { API_BASE_URL } from '../../../constants/api';

// WebSocket URL: http -> ws, https -> wss
const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

export default function ChatScreen() {
  const { chatRoomId } = useLocalSearchParams<{ chatRoomId: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [myId, setMyId] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList<ChatMessageResponse>>(null);

  // 채팅 기록 로드
  useEffect(() => {
    if (!chatRoomId) return;
    fetchChatHistory(chatRoomId)
      .then((history) => {
        setMessages(history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chatRoomId]);

  // STOMP WebSocket 연결
  useEffect(() => {
    if (!chatRoomId) return;

    let stompClient: Client;

    const connect = async () => {
      const token = await tokenStorage.get();

      stompClient = new Client({
        brokerURL: WS_URL,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 5000,
        onConnect: () => {
          stompClient.subscribe(`/topic/chat.${chatRoomId}`, (frame) => {
            try {
              const msg: ChatMessageResponse = JSON.parse(frame.body);
              setMessages((prev) => {
                // 중복 방지
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            } catch {
              // 파싱 실패 무시
            }
          });
        },
        onDisconnect: () => {},
        onStompError: () => {},
      });

      stompClient.activate();
      clientRef.current = stompClient;
    };

    connect();

    return () => {
      stompClient?.deactivate();
    };
  }, [chatRoomId]);

  // 메시지 추가 시 스크롤 아래로
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: `/app/chat.${chatRoomId}`,
      body: JSON.stringify({ content }),
    });

    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom}
    >
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Q&A CHAT</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 메시지 목록 */}
      {loading ? (
        <ActivityIndicator color="#4FC3F7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={myId ? item.senderId === myId : false}
            />
          )}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* 입력창 */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={styles.textInput}
          placeholder="메시지 입력..."
          placeholderTextColor="#555"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendBtnText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

interface MessageBubbleProps {
  message: ChatMessageResponse;
  isMine: boolean;
}

function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowOther]}>
      {!isMine && (
        <Text style={styles.senderName}>{message.senderNickname}</Text>
      )}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.bubbleTime}>{time}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  backBtn: {
    color: '#4FC3F7',
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 11,
    color: '#4FC3F7',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  bubbleRow: {
    maxWidth: '80%',
    gap: 4,
  },
  bubbleRowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleRowOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    color: '#888',
    fontSize: 11,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: '#4FC3F7',
  },
  bubbleOther: {
    backgroundColor: '#1E1E1E',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: '#111',
  },
  bubbleTime: {
    color: '#444',
    fontSize: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#4FC3F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 13,
  },
});

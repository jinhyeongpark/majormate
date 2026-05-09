import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RoomInvitation, acceptInvitation, declineInvitation } from '../src/api/rooms';

interface Props {
  invitations: RoomInvitation[];
  onRefresh: () => void;
}

export default function RoomInvitationsView({ invitations, onRefresh }: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (inv: RoomInvitation) => {
    setProcessingId(inv.id);
    try {
      await acceptInvitation(inv.id);
      onRefresh();
    } catch (e) {
      console.log('초대 수락 실패', e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (inv: RoomInvitation) => {
    setProcessingId(inv.id);
    try {
      await declineInvitation(inv.id);
      onRefresh();
    } catch (e) {
      console.log('초대 거절 실패', e);
    } finally {
      setProcessingId(null);
    }
  };

  if (invitations.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>NO INVITATIONS</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invitations}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const isProcessing = processingId === item.id;
        const date = new Date(item.createdAt).toLocaleDateString('ko-KR', {
          month: '2-digit',
          day: '2-digit',
        });
        return (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.roomName}>{item.roomName}</Text>
              <Text style={styles.inviterText}>{item.inviterNickname}님이 초대했어요</Text>
              <Text style={styles.dateText}>{date}</Text>
            </View>
            <View style={styles.actions}>
              {isProcessing ? (
                <ActivityIndicator size="small" color="#B8FF00" />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.acceptBtnText}>수락</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDecline(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.declineBtnText}>거절</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#555',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  roomName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  inviterText: {
    color: '#888',
    fontSize: 11,
  },
  dateText: {
    color: '#555',
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#B8FF00',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  acceptBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#0D1800',
  },
  declineBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  declineBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#aaa',
  },
});

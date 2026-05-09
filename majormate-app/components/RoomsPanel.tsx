import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  RoomInvitation,
  RoomSummary,
  fetchMyRooms,
  fetchReceivedInvitations,
  leaveRoom,
} from '../src/api/rooms';
import CreateRoomModal from './CreateRoomModal';
import RoomInvitationsView from './RoomInvitationsView';

interface Props {
  onEnterRoom: (room: RoomSummary) => void;
  onClose: () => void;
}

type Tab = 'rooms' | 'invitations';

export default function RoomsPanel({ onEnterRoom, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('rooms');
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [invitations, setInvitations] = useState<RoomInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createVisible, setCreateVisible] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([fetchMyRooms(), fetchReceivedInvitations()])
      .then(([r, inv]) => {
        setRooms(r);
        setInvitations(inv);
      })
      .catch((e) => console.log('rooms panel load error', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLeave = async (roomId: string) => {
    try {
      await leaveRoom(roomId);
      loadData();
    } catch (e) {
      console.log('방 탈퇴 실패', e);
    }
  };

  const majorRoom = rooms.find((r) => r.type === 'MAJOR') ?? null;
  const customRooms = rooms.filter((r) => r.type === 'CUSTOM');

  return (
    <View style={styles.panel}>
      {/* Panel header */}
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>ROOMS</Text>
        <View style={styles.headerActions}>
          {tab === 'rooms' && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setCreateVisible(true)} hitSlop={8}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <View style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'rooms' && styles.tabBtnActive]}
          onPress={() => setTab('rooms')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, tab === 'rooms' && styles.tabTextActive]}>내 방</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'invitations' && styles.tabBtnActive]}
          onPress={() => setTab('invitations')}
          activeOpacity={0.7}
        >
          <View style={styles.tabLabelRow}>
            <Text style={[styles.tabText, tab === 'invitations' && styles.tabTextActive]}>
              받은 초대
            </Text>
            {invitations.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{invitations.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator color="#B8FF00" />
        </View>
      ) : tab === 'rooms' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
          {/* MAJOR 방 (상단 고정) */}
          {majorRoom && (
            <>
              <Text style={styles.sectionLabel}>MAJOR</Text>
              <RoomItem room={majorRoom} onPress={() => onEnterRoom(majorRoom)} showLeave={false} />
            </>
          )}

          {/* CUSTOM 방 목록 */}
          <Text style={[styles.sectionLabel, majorRoom && { marginTop: 20 }]}>CUSTOM</Text>
          {customRooms.length === 0 ? (
            <Text style={styles.empty}>NO ROOMS</Text>
          ) : (
            customRooms.map((room) => (
              <RoomItem
                key={room.id}
                room={room}
                onPress={() => onEnterRoom(room)}
                showLeave
                onLeave={() => handleLeave(room.id)}
              />
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.scrollArea}>
          <RoomInvitationsView invitations={invitations} onRefresh={loadData} />
        </View>
      )}

      <CreateRoomModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={loadData}
      />
    </View>
  );
}

interface RoomItemProps {
  room: RoomSummary;
  onPress: () => void;
  showLeave: boolean;
  onLeave?: () => void;
}

function RoomItem({ room, onPress, showLeave, onLeave }: RoomItemProps) {
  return (
    <TouchableOpacity style={styles.roomRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.roomInfo}>
        <View style={styles.roomNameRow}>
          <Text style={styles.roomName}>{room.name}</Text>
          {room.type === 'MAJOR' && (
            <View style={styles.majorBadge}>
              <Text style={styles.majorBadgeText}>전공</Text>
            </View>
          )}
        </View>
        <Text style={styles.roomMeta}>
          {room.major ? `${room.major}  ·  ` : ''}{room.memberCount}/{room.maxMembers}명
        </Text>
      </View>
      {showLeave && onLeave ? (
        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={(e) => { e.stopPropagation(); onLeave(); }}
          hitSlop={8}
        >
          <Text style={styles.leaveBtnText}>탈퇴</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.arrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  panelTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#4FC3F7',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#B8FF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#0D1800',
    lineHeight: 18,
  },
  closeButton: {
    width: 28,
    height: 28,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#aaa',
    lineHeight: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 12,
  },
  tabBtn: {
    paddingBottom: 8,
    paddingHorizontal: 4,
    marginRight: 20,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#B8FF00',
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#555',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#B8FF00',
  },
  badge: {
    backgroundColor: '#E05252',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
  loadingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  sectionLabel: {
    color: '#555',
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 8,
    fontFamily: 'PressStart2P_400Regular',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  roomInfo: {
    flex: 1,
  },
  roomNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  roomName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  majorBadge: {
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#4FC3F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  majorBadgeText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    color: '#4FC3F7',
  },
  roomMeta: {
    color: '#666',
    fontSize: 11,
  },
  leaveBtn: {
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: '#E05252',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  leaveBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    color: '#E05252',
  },
  arrow: {
    color: '#555',
    fontSize: 22,
    marginLeft: 8,
  },
  empty: {
    color: '#555',
    fontSize: 8,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'PressStart2P_400Regular',
  },
});

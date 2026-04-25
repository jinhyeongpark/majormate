import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RoomSummary, fetchRooms } from '../src/api/rooms';

interface Props {
  onEnterRoom: (room: RoomSummary) => void;
  onClose: () => void;
}

export default function RoomsPanel({ onEnterRoom, onClose }: Props) {
  const [majorRooms, setMajorRooms] = useState<RoomSummary[]>([]);
  const [customRooms, setCustomRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRooms({ type: 'MAJOR' }), fetchRooms({ type: 'CUSTOM' })])
      .then(([major, custom]) => {
        setMajorRooms(major);
        setCustomRooms(custom);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.panel}>
        <ActivityIndicator color="#4FC3F7" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>ROOMS</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <View style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {majorRooms.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>MAJOR</Text>
            {majorRooms.map((room) => (
              <RoomItem key={room.id} room={room} onPress={() => onEnterRoom(room)} />
            ))}
          </>
        )}

        <Text style={[styles.sectionLabel, majorRooms.length > 0 && { marginTop: 20 }]}>
          CUSTOM
        </Text>
        {customRooms.length === 0 ? (
          <Text style={styles.empty}>NO ROOMS</Text>
        ) : (
          customRooms.map((room) => (
            <RoomItem key={room.id} room={room} onPress={() => onEnterRoom(room)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function RoomItem({ room, onPress }: { room: RoomSummary; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.roomRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomMeta}>
          {room.major}  ·  {room.memberCount}/{room.maxMembers}명
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
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
    marginBottom: 16,
  },
  panelTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#4FC3F7',
    letterSpacing: 1,
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
  roomName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  roomMeta: {
    color: '#666',
    fontSize: 11,
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

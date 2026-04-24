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
}

export default function RoomsPanel({ onEnterRoom }: Props) {
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {majorRooms.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>전공방</Text>
            {majorRooms.map((room) => (
              <RoomItem key={room.id} room={room} onPress={() => onEnterRoom(room)} />
            ))}
          </>
        )}

        <Text style={[styles.sectionLabel, majorRooms.length > 0 && { marginTop: 20 }]}>
          커스텀방
        </Text>
        {customRooms.length === 0 ? (
          <Text style={styles.empty}>커스텀방이 없습니다</Text>
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
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});

import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CharacterRenderer, { CharacterLayers } from '../../components/CharacterRenderer';
import FriendsPanel from '../../components/FriendsPanel';
import RoomsPanel from '../../components/RoomsPanel';
import RoomView from '../../components/RoomView';
import { API_BASE_URL } from '../../constants/api';
import { registerFcmToken } from '../../src/api/notifications';
import { RoomSummary } from '../../src/api/rooms';
import { formatElapsed, useStopwatch } from '../../src/hooks/useStopwatch';

const ICON_GROUPS = require('../../assets/icons/groups_icon.png');
const ICON_ADD_FRIEND = require('../../assets/icons/add_friend_icon.png');
const BUBBLE = require('../../assets/icons/sentence.png');

type Panel = 'none' | 'friends' | 'rooms' | 'room';

const SPEECHES: Record<string, string[]> = {
  idle: ['ready?', "let's go!", 'focus up!', 'grind time!', 'tick tock!', 'start now!'],
  running: ['no quitting!', 'stay sharp!', 'on fire!', 'locked in!', 'keep going!', 'beast mode!'],
  paused: ['resting?', 'take 5!', 'come back!', "don't quit!", 'hydrate!', 'back soon?'],
};

function pickSpeech(status: string) {
  const list = SPEECHES[status] ?? SPEECHES.idle;
  return list[Math.floor(Math.random() * list.length)];
}

const BTN_DEFS = {
  start: { bg: '#B8FF00', shadow: '#527000', text: '#0D1800' },
  stop:  { bg: '#F4A261', shadow: '#8C4510', text: '#1A0A00' },
  end:   { bg: '#E05252', shadow: '#8C1818', text: '#1A0000' },
} as const;

function PixelButton({
  type,
  label,
  onPress,
  style,
}: {
  type: keyof typeof BTN_DEFS;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  const c = BTN_DEFS[type];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
      <View style={{ backgroundColor: c.shadow, paddingRight: 4, paddingBottom: 4 }}>
        <View style={{ backgroundColor: c.bg, height: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Text
            numberOfLines={1}
            style={{ fontFamily: 'PressStart2P_400Regular', fontSize: 9, color: c.text, letterSpacing: 0 }}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [panel, setPanel] = useState<Panel>('none');
  const [currentRoom, setCurrentRoom] = useState<RoomSummary | null>(null);
  const [character, setCharacter] = useState<CharacterLayers>({ gender: 'male' });
  const [nickname, setNickname] = useState<string | null>(null);
  const [major, setMajor] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const stopwatch = useStopwatch();
  const speech = useMemo(() => pickSpeech(stopwatch.status), [stopwatch.status]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/me/character`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setCharacter(data))
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/users/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setNickname(data.nickname ?? null);
        setMajor(data.major ?? null);
        setGender(data.gender ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    registerFcmToken();
  }, []);

  const toggleOverlay = (target: 'friends' | 'rooms') => {
    if (panel === 'room') return;
    setPanel((p) => (p === target ? 'none' : target));
  };

  const handleEnterRoom = (room: RoomSummary) => {
    setCurrentRoom(room);
    setPanel('room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setPanel('none');
  };

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => toggleOverlay('rooms')} hitSlop={12}>
          <Image source={ICON_GROUPS} style={styles.topIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleOverlay('friends')} hitSlop={12}>
          <Image source={ICON_ADD_FRIEND} style={styles.topIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Stopwatch display */}
      <View style={styles.clockRow}>
        <Text style={styles.clock} numberOfLines={1} adjustsFontSizeToFit>
          {formatElapsed(stopwatch.elapsedMs)}
        </Text>
      </View>

      {/* Main content area */}
      <View style={styles.contentArea}>
        {panel === 'friends' ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPanel('none')}>
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.panelWrapper}>
              <FriendsPanel onClose={() => setPanel('none')} />
            </Pressable>
          </Pressable>
        ) : panel === 'rooms' ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPanel('none')}>
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.panelWrapper}>
              <RoomsPanel onEnterRoom={handleEnterRoom} onClose={() => setPanel('none')} />
            </Pressable>
          </Pressable>
        ) : panel === 'room' && currentRoom ? (
          <View style={styles.panelWrapper}>
            <RoomView room={currentRoom} onLeave={handleLeaveRoom} />
          </View>
        ) : (
          <View style={styles.characterArea}>
            <View style={styles.characterWrapper}>
              <ImageBackground source={BUBBLE} style={styles.speechBubble} resizeMode="stretch">
                <Text numberOfLines={1} style={styles.speechText}>{speech}</Text>
              </ImageBackground>
              {/* TODO(Phase 5): 공부 시작 시 캐릭터 장착 악세서리(노트북/커피) 모션 연출 */}
              <CharacterRenderer layers={character} size={200} />
            </View>
            <Text style={styles.nickname}>{nickname ?? '---'}</Text>
            <Text style={styles.tags}>
              {`#${major ?? '???'}  #${(gender ?? 'unknown').toLowerCase()}`}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom controls — fixed height to prevent layout shift */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.controlRow}>
          {stopwatch.status === 'running' ? (
            <>
              <PixelButton type="stop" label="STOP" onPress={stopwatch.pause} style={{ flex: 1 }} />
              <PixelButton type="end" label="END" onPress={stopwatch.end} style={{ width: 96 }} />
            </>
          ) : stopwatch.status === 'paused' ? (
            <>
              <PixelButton type="start" label="RESUME" onPress={stopwatch.resume} style={{ flex: 1 }} />
              <PixelButton type="end" label="END" onPress={stopwatch.end} style={{ width: 96 }} />
            </>
          ) : (
            <>
              <View style={{ flex: 1 }} />
              <PixelButton type="start" label="START" onPress={stopwatch.start} style={{ width: 180 }} />
              <View style={{ flex: 1 }} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111111',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  topIcon: {
    width: 36,
    height: 36,
  },
  clockRow: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  clock: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 36,
    color: '#4FC3F7',
    letterSpacing: 2,
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  panelWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  characterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 60,
  },
  characterWrapper: {
    width: 200,
    height: 200,
  },
  speechBubble: {
    position: 'absolute',
    top: -72,
    left: -72,
    width: 160,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 24,
    paddingTop: 4,
  },
  speechText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#222',
    textAlign: 'center',
  },
  nickname: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 1,
  },
  tags: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#666',
    letterSpacing: 1,
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

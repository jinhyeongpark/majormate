import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CharacterRenderer, { CharacterLayers } from '../../components/CharacterRenderer';
import FriendsPanel from '../../components/FriendsPanel';
import RoomsPanel from '../../components/RoomsPanel';
import RoomView from '../../components/RoomView';
import { API_BASE_URL } from '../../constants/api';
import { RoomSummary } from '../../src/api/rooms';
import { formatElapsed, useStopwatch } from '../../src/hooks/useStopwatch';

const ICON_GROUPS = require('../../assets/icons/groups_icon.png');
const ICON_ADD_FRIEND = require('../../assets/icons/add_friend_icon.png');
const BTN_START = require('../../assets/icons/start_but.png');
const BTN_STOP = require('../../assets/icons/stop_but.png');
const BTN_END = require('../../assets/icons/end_but.png');
const BUBBLE = require('../../assets/icons/sentence.png');

type Panel = 'none' | 'friends' | 'rooms' | 'room';

const SPEECHES: Record<string, string[]> = {
  idle: [
    'ready?',
    "let's go!",
    'focus up!',
    'grind time!',
    'tick tock!',
    'start now!',
  ],
  running: [
    'no quitting!',
    'stay sharp!',
    'on fire!',
    'locked in!',
    'keep going!',
    'beast mode!',
  ],
  paused: [
    'resting?',
    'take 5!',
    'come back!',
    "don't quit!",
    'hydrate!',
    'back soon?',
  ],
};

function pickSpeech(status: string) {
  const list = SPEECHES[status] ?? SPEECHES.idle;
  return list[Math.floor(Math.random() * list.length)];
}

export default function HomeScreen() {
  const [panel, setPanel] = useState<Panel>('none');
  const [currentRoom, setCurrentRoom] = useState<RoomSummary | null>(null);
  const [character, setCharacter] = useState<CharacterLayers>({ gender: 'male' });
  const insets = useSafeAreaInsets();
  const stopwatch = useStopwatch();
  const speech = useMemo(() => pickSpeech(stopwatch.status), [stopwatch.status]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/me/character`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setCharacter(data))
      .catch(() => {});
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
            <Text style={styles.tags}># Computer Science # Male</Text>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {stopwatch.status === 'running' ? (
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={stopwatch.pause} activeOpacity={0.8}>
              <Image source={BTN_STOP} style={styles.controlBtnImg} resizeMode="stretch" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={stopwatch.end} activeOpacity={0.8}>
              <Image source={BTN_END} style={styles.controlBtnImg} resizeMode="stretch" />
            </TouchableOpacity>
          </View>
        ) : stopwatch.status === 'paused' ? (
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={stopwatch.resume} activeOpacity={0.8}>
              <Image source={BTN_START} style={styles.controlBtnImg} resizeMode="stretch" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={stopwatch.end} activeOpacity={0.8}>
              <Image source={BTN_END} style={styles.controlBtnImg} resizeMode="stretch" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={stopwatch.start} activeOpacity={0.8}>
            <Image source={BTN_START} style={styles.startButton} resizeMode="stretch" />
          </TouchableOpacity>
        )}
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
    gap: 8,
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
  tags: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#888',
    marginTop: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  startButton: {
    width: 134,
    height: 64,
    alignSelf: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    flex: 1,
  },
  controlBtnImg: {
    width: '100%',
    height: 56,
    borderRadius: 8,
  },
});

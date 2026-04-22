import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_GROUPS = require('../../assets/icons/groups_icon.png');
const ICON_ADD_FRIEND = require('../../assets/icons/add_friend_icon.png');
import CharacterRenderer, { CharacterLayers } from '../../components/CharacterRenderer';
import FriendsPanel from '../../components/FriendsPanel';

type Panel = 'none' | 'friends';

const DEFAULT_CHARACTER: CharacterLayers = {
  gender: 'male',
  top: 'top_01',
  bottom: 'bottom_01',
  shoes: 'shoes_01',
  hair: 'hair_01',
};

const SPEECH_IDLE = 'keep studying bro';

export default function HomeScreen() {
  const [panel, setPanel] = useState<Panel>('none');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => setPanel((p) => (p === 'friends' ? 'none' : 'friends'))} hitSlop={12}>
          <Image source={ICON_GROUPS} style={styles.topIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPanel((p) => (p === 'friends' ? 'none' : 'friends'))} hitSlop={12}>
          <Image source={ICON_ADD_FRIEND} style={styles.topIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Stopwatch */}
      <View style={styles.clockRow}>
        <Text style={styles.clock} numberOfLines={1} adjustsFontSizeToFit>
          00 : 00 . 00
        </Text>
      </View>

      {/* Main content */}
      <View style={styles.contentArea}>
        {panel === 'friends' ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPanel('none')}>
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.panelWrapper}>
              <FriendsPanel />
            </Pressable>
          </Pressable>
        ) : (
          <View style={styles.characterArea}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{SPEECH_IDLE}</Text>
              <View style={styles.speechTail} />
            </View>
            <CharacterRenderer layers={DEFAULT_CHARACTER} size={200} />
            <Text style={styles.tags}># Computer Science # Male</Text>
          </View>
        )}
      </View>

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>START</Text>
        </TouchableOpacity>
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
  speechBubble: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 220,
    position: 'relative',
  },
  speechTail: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  speechText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#222',
    lineHeight: 16,
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
  actionButton: {
    backgroundColor: '#2B3580',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 4,
  },
});

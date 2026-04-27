import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Pixel art maps (1=on, 0=off) ────────────────────────────────────────────

// House shape 5×5
const HOME_MAP = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 0, 1, 1],
];

// Speech bubble 5×5 (tail at bottom-center)
const CHAT_MAP = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];

// Ascending bar chart 5×4
const STATS_MAP = [
  [0, 0, 0, 0, 1],
  [0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
];

// ── Components ───────────────────────────────────────────────────────────────

function PixelGrid({ map, color, px }: { map: number[][]; color: string; px: number }) {
  return (
    <View>
      {map.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((on, ci) => (
            <View
              key={ci}
              style={{ width: px, height: px, backgroundColor: on ? color : 'transparent' }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function PixLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text
      style={{
        fontFamily: 'PressStart2P_400Regular',
        fontSize: 7,
        color,
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#1E1E1E',
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#B8FF00',
        tabBarInactiveTintColor: '#444',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <PixelGrid map={HOME_MAP} color={color} px={4} />,
          tabBarLabel: ({ color }) => <PixLabel label="HOME" color={color} />,
        }}
      />
      <Tabs.Screen
        name="qa-inbox"
        options={{
          tabBarIcon: ({ color }) => <PixelGrid map={CHAT_MAP} color={color} px={4} />,
          tabBarLabel: ({ color }) => <PixLabel label="CHAT" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color }) => <PixelGrid map={STATS_MAP} color={color} px={4} />,
          tabBarLabel: ({ color }) => <PixLabel label="STATS" color={color} />,
        }}
      />
    </Tabs>
  );
}

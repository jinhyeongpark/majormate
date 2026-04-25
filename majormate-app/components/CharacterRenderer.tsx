import { useRef } from 'react';
import { Animated, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

export type CharacterGender = 'male' | 'female';

export type CharacterLayers = {
  gender: CharacterGender;
  bottom?: string | null;
  top?: string | null;
  shoes?: string | null;
  hair?: string | null;
  bag?: string | null;
  glasses?: string | null;
  item?: string | null;
};

export type LayerKey = Exclude<keyof CharacterLayers, 'gender'>;

// Strict render order — bottom layers first
const LAYER_ORDER: LayerKey[] = ['bottom', 'top', 'shoes', 'hair', 'bag', 'glasses', 'item'];

const DEFAULT_BODIES: Partial<Record<CharacterGender, ImageSourcePropType>> = {
  male: require('../assets/characters/male/default.png'),
  // female: require('../assets/characters/female/default.png'), // 추가 예정
};

function LayerImage({ uri, size }: { uri: string; size: number }) {
  const opacity = useRef(new Animated.Value(0)).current;

  return (
    <Animated.Image
      source={{ uri }}
      style={[StyleSheet.absoluteFill, { width: size, height: size, opacity }]}
      resizeMode="contain"
      onLoad={() =>
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start()
      }
    />
  );
}

type Props = {
  layers: CharacterLayers;
  size?: number;
};

export default function CharacterRenderer({ layers, size = 160 }: Props) {
  const defaultBody = DEFAULT_BODIES[layers.gender];

  return (
    <View style={{ width: size, height: size }}>
      {defaultBody && (
        <Image
          source={defaultBody}
          style={[StyleSheet.absoluteFill, { width: size, height: size }]}
          resizeMode="contain"
        />
      )}
      {LAYER_ORDER.map((layerKey) => {
        const url = layers[layerKey];
        if (!url) return null;
        return <LayerImage key={layerKey} uri={url} size={size} />;
      })}
    </View>
  );
}

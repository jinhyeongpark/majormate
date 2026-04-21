import { Image, StyleSheet, View } from 'react-native';

export type CharacterGender = 'male' | 'female';

export type CharacterLayers = {
  gender: CharacterGender;
  bottom?: string | null;       // e.g. "bottom_01"
  top?: string | null;          // e.g. "top_03"
  shoes?: string | null;        // e.g. "shoes_02"
  hair?: string | null;         // e.g. "hair_05"
  bag?: string | null;          // e.g. "bag_01"
  glasses?: string | null;      // e.g. "glasses_03"
  item?: string | null;         // e.g. "item_07"
};

export type LayerKey = Exclude<keyof CharacterLayers, 'gender'>;

// Strict render order — bottom layers first
const LAYER_ORDER: LayerKey[] = ['bottom', 'top', 'shoes', 'hair', 'bag', 'glasses', 'item'];

// React Native requires static require() calls — dynamic requires are not supported in Metro.
// This registry maps every known asset path to its require() result.
const ASSET_REGISTRY: Record<string, Record<string, ReturnType<typeof require>>> = {
  'male/bottom': {
    bottom_01: require('../assets/characters/male/bottom/bottom_01.png'),
    bottom_02: require('../assets/characters/male/bottom/bottom_02.png'),
    bottom_03: require('../assets/characters/male/bottom/bottom_03.png'),
    bottom_04: require('../assets/characters/male/bottom/bottom_04.png'),
    bottom_05: require('../assets/characters/male/bottom/bottom_05.png'),
    bottom_06: require('../assets/characters/male/bottom/bottom_06.png'),
    bottom_07: require('../assets/characters/male/bottom/bottom_07.png'),
    bottom_08: require('../assets/characters/male/bottom/bottom_08.png'),
  },
  'male/top': {
    top_01: require('../assets/characters/male/top/top_01.png'),
    top_02: require('../assets/characters/male/top/top_02.png'),
    top_03: require('../assets/characters/male/top/top_03.png'),
    top_04: require('../assets/characters/male/top/top_04.png'),
    top_05: require('../assets/characters/male/top/top_05.png'),
    top_06: require('../assets/characters/male/top/top_06.png'),
    top_07: require('../assets/characters/male/top/top_07.png'),
    top_08: require('../assets/characters/male/top/top_08.png'),
  },
  'male/shoes': {
    shoes_01: require('../assets/characters/male/shoes/shoes_01.png'),
    shoes_02: require('../assets/characters/male/shoes/shoes_02.png'),
    shoes_03: require('../assets/characters/male/shoes/shoes_03.png'),
    shoes_04: require('../assets/characters/male/shoes/shoes_04.png'),
    shoes_05: require('../assets/characters/male/shoes/shoes_05.png'),
    shoes_06: require('../assets/characters/male/shoes/shoes_06.png'),
    shoes_07: require('../assets/characters/male/shoes/shoes_07.png'),
    shoes_08: require('../assets/characters/male/shoes/shoes_08.png'),
  },
  'male/hair': {
    hair_01: require('../assets/characters/male/hair/hair_01.png'),
    hair_02: require('../assets/characters/male/hair/hair_02.png'),
    hair_03: require('../assets/characters/male/hair/hair_03.png'),
    hair_04: require('../assets/characters/male/hair/hair_04.png'),
    hair_05: require('../assets/characters/male/hair/hair_05.png'),
    hair_06: require('../assets/characters/male/hair/hair_06.png'),
    hair_07: require('../assets/characters/male/hair/hair_07.png'),
    hair_08: require('../assets/characters/male/hair/hair_08.png'),
  },
  'male/bag': {
    bag_01: require('../assets/characters/male/bag/bag_01.png'),
    bag_02: require('../assets/characters/male/bag/bag_02.png'),
    bag_03: require('../assets/characters/male/bag/bag_03.png'),
    bag_04: require('../assets/characters/male/bag/bag_04.png'),
    bag_05: require('../assets/characters/male/bag/bag_05.png'),
    bag_06: require('../assets/characters/male/bag/bag_06.png'),
    bag_07: require('../assets/characters/male/bag/bag_07.png'),
    bag_08: require('../assets/characters/male/bag/bag_08.png'),
  },
  'male/glasses': {
    glasses_01: require('../assets/characters/male/glasses/glasses_01.png'),
    glasses_02: require('../assets/characters/male/glasses/glasses_02.png'),
    glasses_03: require('../assets/characters/male/glasses/glasses_03.png'),
    glasses_04: require('../assets/characters/male/glasses/glasses_04.png'),
    glasses_05: require('../assets/characters/male/glasses/glasses_05.png'),
    glasses_06: require('../assets/characters/male/glasses/glasses_06.png'),
    glasses_07: require('../assets/characters/male/glasses/glasses_07.png'),
    glasses_08: require('../assets/characters/male/glasses/glasses_08.png'),
  },
  'male/item': {
    item_01: require('../assets/characters/male/item/item_01.png'),
    item_02: require('../assets/characters/male/item/item_02.png'),
    item_03: require('../assets/characters/male/item/item_03.png'),
    item_04: require('../assets/characters/male/item/item_04.png'),
    item_05: require('../assets/characters/male/item/item_05.png'),
    item_06: require('../assets/characters/male/item/item_06.png'),
    item_07: require('../assets/characters/male/item/item_07.png'),
    item_08: require('../assets/characters/male/item/item_08.png'),
  },
  'female/bottom': {
    bottom_01: require('../assets/characters/female/bottom/bottom_01.png'),
    bottom_02: require('../assets/characters/female/bottom/bottom_02.png'),
    bottom_03: require('../assets/characters/female/bottom/bottom_03.png'),
    bottom_04: require('../assets/characters/female/bottom/bottom_04.png'),
    bottom_05: require('../assets/characters/female/bottom/bottom_05.png'),
    bottom_06: require('../assets/characters/female/bottom/bottom_06.png'),
    bottom_07: require('../assets/characters/female/bottom/bottom_07.png'),
    bottom_08: require('../assets/characters/female/bottom/bottom_08.png'),
  },
  'female/top': {
    top_01: require('../assets/characters/female/top/top_01.png'),
    top_02: require('../assets/characters/female/top/top_02.png'),
    top_03: require('../assets/characters/female/top/top_03.png'),
    top_04: require('../assets/characters/female/top/top_04.png'),
    top_05: require('../assets/characters/female/top/top_05.png'),
    top_06: require('../assets/characters/female/top/top_06.png'),
    top_07: require('../assets/characters/female/top/top_07.png'),
    top_08: require('../assets/characters/female/top/top_08.png'),
  },
  'female/shoes': {
    shoes_01: require('../assets/characters/female/shoes/shoes_01.png'),
    shoes_02: require('../assets/characters/female/shoes/shoes_02.png'),
    shoes_03: require('../assets/characters/female/shoes/shoes_03.png'),
    shoes_04: require('../assets/characters/female/shoes/shoes_04.png'),
    shoes_05: require('../assets/characters/female/shoes/shoes_05.png'),
    shoes_06: require('../assets/characters/female/shoes/shoes_06.png'),
    shoes_07: require('../assets/characters/female/shoes/shoes_07.png'),
    shoes_08: require('../assets/characters/female/shoes/shoes_08.png'),
  },
  'female/hair': {
    hair_01: require('../assets/characters/female/hair/hair_01.png'),
    hair_02: require('../assets/characters/female/hair/hair_02.png'),
    hair_03: require('../assets/characters/female/hair/hair_03.png'),
    hair_04: require('../assets/characters/female/hair/hair_04.png'),
    hair_05: require('../assets/characters/female/hair/hair_05.png'),
    hair_06: require('../assets/characters/female/hair/hair_06.png'),
    hair_07: require('../assets/characters/female/hair/hair_07.png'),
    hair_08: require('../assets/characters/female/hair/hair_08.png'),
  },
  'female/bag': {
    bag_01: require('../assets/characters/female/bag/bag_01.png'),
    bag_02: require('../assets/characters/female/bag/bag_02.png'),
    bag_03: require('../assets/characters/female/bag/bag_03.png'),
    bag_04: require('../assets/characters/female/bag/bag_04.png'),
    bag_05: require('../assets/characters/female/bag/bag_05.png'),
    bag_06: require('../assets/characters/female/bag/bag_06.png'),
    bag_07: require('../assets/characters/female/bag/bag_07.png'),
    bag_08: require('../assets/characters/female/bag/bag_08.png'),
  },
  'female/glasses': {
    glasses_01: require('../assets/characters/female/glasses/glasses_01.png'),
    glasses_02: require('../assets/characters/female/glasses/glasses_02.png'),
    glasses_03: require('../assets/characters/female/glasses/glasses_03.png'),
    glasses_04: require('../assets/characters/female/glasses/glasses_04.png'),
    glasses_05: require('../assets/characters/female/glasses/glasses_05.png'),
    glasses_06: require('../assets/characters/female/glasses/glasses_06.png'),
    glasses_07: require('../assets/characters/female/glasses/glasses_07.png'),
    glasses_08: require('../assets/characters/female/glasses/glasses_08.png'),
  },
  'female/item': {
    item_01: require('../assets/characters/female/item/item_01.png'),
    item_02: require('../assets/characters/female/item/item_02.png'),
    item_03: require('../assets/characters/female/item/item_03.png'),
    item_04: require('../assets/characters/female/item/item_04.png'),
    item_05: require('../assets/characters/female/item/item_05.png'),
    item_06: require('../assets/characters/female/item/item_06.png'),
    item_07: require('../assets/characters/female/item/item_07.png'),
    item_08: require('../assets/characters/female/item/item_08.png'),
  },
};

type Props = {
  layers: CharacterLayers;
  size?: number;
};

export default function CharacterRenderer({ layers, size = 160 }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      {LAYER_ORDER.map((layerKey) => {
        const assetId = layers[layerKey];
        if (!assetId) return null;

        const source = ASSET_REGISTRY[`${layers.gender}/${layerKey}`]?.[assetId];
        if (!source) return null;

        return (
          <Image
            key={layerKey}
            source={source}
            style={[StyleSheet.absoluteFill, { width: size, height: size }]}
            resizeMode="contain"
          />
        );
      })}
    </View>
  );
}

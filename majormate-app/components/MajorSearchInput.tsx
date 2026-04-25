import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Major, fetchMajors } from '../src/api/majors';

interface Props {
  value: string;
  onChange: (nameKo: string) => void;
}

export default function MajorSearchInput({ value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [allMajors, setAllMajors] = useState<Major[]>([]);
  const [filtered, setFiltered] = useState<Major[]>([]);
  const [open, setOpen] = useState(false);
  const selected = useRef(false);

  useEffect(() => {
    fetchMajors()
      .then(setAllMajors)
      .catch(() => {});
  }, []);

  const handleChange = (text: string) => {
    selected.current = false;
    setQuery(text);
    onChange('');
    if (text.length === 0) {
      setFiltered([]);
      setOpen(false);
      return;
    }
    const q = text.toLowerCase();
    const results = allMajors.filter(
      (m) => m.nameKo.includes(text) || m.nameEn.toLowerCase().includes(q)
    );
    setFiltered(results);
    setOpen(results.length > 0);
  };

  const handleSelect = (major: Major) => {
    selected.current = true;
    setQuery(major.nameKo);
    onChange(major.nameKo);
    setOpen(false);
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Search major..."
        placeholderTextColor="#444"
        value={query}
        onChangeText={handleChange}
      />
      {open && (
        <View style={styles.dropdown}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
                <Text style={styles.itemKo}>{item.nameKo}</Text>
                <Text style={styles.itemEn}>{item.nameEn}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  dropdown: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 220,
    zIndex: 999,
  },
  list: {
    flexGrow: 0,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  itemKo: {
    color: '#fff',
    fontSize: 13,
  },
  itemEn: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
});

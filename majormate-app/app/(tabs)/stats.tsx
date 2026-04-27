import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatsPeriod, StatsResponse, fetchStats } from '../../src/api/stats';

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<StatsPeriod>('WEEKLY');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchStats(period)
      .then((data) => {
        setStats(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [period]);

  const maxSeconds =
    stats?.dailyBreakdown?.reduce((acc, d) => Math.max(acc, d.seconds), 1) ?? 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>STATS</Text>

      {/* 기간 탭 */}
      <View style={styles.tabs}>
        {(['WEEKLY', 'MONTHLY'] as StatsPeriod[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.tab, period === p && styles.tabActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
              {p === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#4FC3F7" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>데이터를 불러올 수 없습니다</Text>
        </View>
      ) : stats ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 총 학습 시간 */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatSeconds(stats.totalSeconds)}</Text>
          </View>

          {/* 일별 막대 차트 */}
          {stats.dailyBreakdown?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DAILY BREAKDOWN</Text>
              {stats.dailyBreakdown.map((day) => {
                const barRatio = stats.totalSeconds > 0 ? day.seconds / maxSeconds : 0;
                return (
                  <View key={day.date} style={styles.barRow}>
                    <Text style={styles.barLabel}>
                      {day.date.slice(5)} {/* MM-DD */}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.max(barRatio * 100, day.seconds > 0 ? 2 : 0)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{formatSeconds(day.seconds)}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* 상위 키워드 */}
          {stats.topKeywords?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TOP KEYWORDS</Text>
              <View style={styles.keywordsRow}>
                {stats.topKeywords.map((kw) => (
                  <View key={kw.keyword} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>
                      #{kw.keyword} ({kw.count}회)
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#4FC3F7',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#4FC3F7',
  },
  tabText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#555',
  },
  tabTextActive: {
    color: '#111',
  },
  content: {
    paddingBottom: 40,
    gap: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#555',
  },
  totalCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  totalLabel: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#555',
    marginBottom: 8,
  },
  totalValue: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 28,
    color: '#4FC3F7',
    letterSpacing: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#888',
    marginBottom: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#666',
    width: 40,
  },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#1E1E1E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4FC3F7',
    borderRadius: 4,
  },
  barValue: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    color: '#666',
    width: 48,
    textAlign: 'right',
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#1E1E1E',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  keywordText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#4FC3F7',
  },
});

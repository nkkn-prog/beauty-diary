import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CategoryStats } from '@/types/stats';

type Props = {
  data: CategoryStats[];
};

export function CategoryChart({ data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (data.length === 0) {
    return null;
  }

  const chartData = data.map((item) => ({
    value: item.count,
    color: item.color,
    text: `${item.percentage}%`,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ThemedText style={styles.title}>カテゴリ別</ThemedText>
      <View style={styles.content}>
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            donut
            radius={70}
            innerRadius={45}
            innerCircleColor={colors.surface}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <ThemedText style={styles.centerValue}>
                  {data.reduce((sum, d) => sum + d.count, 0)}
                </ThemedText>
                <ThemedText style={[styles.centerText, { color: colors.textSecondary }]}>
                  回
                </ThemedText>
              </View>
            )}
          />
        </View>
        <View style={styles.legend}>
          {data.map((item) => (
            <View key={item.categoryId} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <ThemedText style={styles.legendLabel}>{item.label}</ThemedText>
              <ThemedText style={[styles.legendValue, { color: colors.textSecondary }]}>
                {item.count}回 ({item.percentage}%)
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    marginRight: 16,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  centerText: {
    fontSize: 11,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
  },
});

import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CategoryStats } from '@/types/stats';

type ViewMode = 'count' | 'expense';

type Props = {
  data: CategoryStats[];
};

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function CategoryChart({ data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [viewMode, setViewMode] = useState<ViewMode>('count');

  if (data.length === 0) {
    return null;
  }

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.totalExpense, 0);

  const chartData = data.map((item) => {
    const value = viewMode === 'count' ? item.count : item.totalExpense;
    const total = viewMode === 'count' ? totalCount : totalExpense;
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return {
      value,
      color: item.color,
      text: `${percentage}%`,
    };
  });

  const legendData = data.map((item) => {
    const value = viewMode === 'count' ? item.count : item.totalExpense;
    const total = viewMode === 'count' ? totalCount : totalExpense;
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return {
      ...item,
      displayValue: viewMode === 'count' ? `${item.count}回` : formatCurrency(item.totalExpense),
      percentage,
    };
  }).sort((a, b) => {
    const aValue = viewMode === 'count' ? a.count : a.totalExpense;
    const bValue = viewMode === 'count' ? b.count : b.totalExpense;
    return bValue - aValue;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>カテゴリ別</ThemedText>
        <View style={[styles.tabs, { backgroundColor: colors.background }]}>
          <Pressable
            style={[
              styles.tab,
              viewMode === 'count' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setViewMode('count')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: viewMode === 'count' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              回数
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              viewMode === 'expense' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setViewMode('expense')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: viewMode === 'expense' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              金額
            </ThemedText>
          </Pressable>
        </View>
      </View>
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
                {viewMode === 'count' ? (
                  <>
                    <ThemedText style={styles.centerValue}>{totalCount}</ThemedText>
                    <ThemedText style={[styles.centerText, { color: colors.textSecondary }]}>
                      回
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText style={[styles.centerValue, styles.centerValueSmall]}>
                      {formatCurrency(totalExpense)}
                    </ThemedText>
                  </>
                )}
              </View>
            )}
          />
        </View>
        <View style={styles.legend}>
          {legendData.map((item) => (
            <View key={item.categoryId} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <ThemedText style={styles.legendLabel}>{item.label}</ThemedText>
              <ThemedText style={[styles.legendValue, { color: colors.textSecondary }]}>
                {item.displayValue} ({item.percentage}%)
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
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
  centerValueSmall: {
    fontSize: 14,
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

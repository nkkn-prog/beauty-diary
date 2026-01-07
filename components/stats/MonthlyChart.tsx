import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MonthlyStats } from '@/types/stats';

type Props = {
  data: MonthlyStats[];
};

function formatMonth(month: string): string {
  const [, m] = month.split('-');
  return `${parseInt(m, 10)}月`;
}

export function MonthlyChart({ data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (data.length === 0) {
    return null;
  }

  const chartData = data.slice(-6).map((item) => ({
    value: item.count,
    label: formatMonth(item.month),
    frontColor: colors.accent,
  }));

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ThemedText style={styles.title}>月別施術回数</ThemedText>
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={28}
          spacing={20}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          noOfSections={Math.min(maxValue, 5)}
          maxValue={maxValue}
          isAnimated
          animationDuration={500}
        />
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
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

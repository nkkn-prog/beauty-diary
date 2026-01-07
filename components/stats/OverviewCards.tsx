import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OverviewStats } from '@/types/stats';

type Props = {
  stats: OverviewStats;
};

function formatCurrency(value: number): string {
  return value.toLocaleString('ja-JP');
}

export function OverviewCards({ stats }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.accent} />
        </View>
        <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
          完了した施術
        </ThemedText>
        <ThemedText style={styles.value}>{stats.totalTreatments}回</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="wallet-outline" size={20} color={colors.accent} />
        </View>
        <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
          総費用
        </ThemedText>
        <ThemedText style={styles.value}>¥{formatCurrency(stats.totalExpense)}</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="calculator-outline" size={20} color={colors.accent} />
        </View>
        <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
          平均費用
        </ThemedText>
        <ThemedText style={styles.value}>¥{formatCurrency(stats.averageExpense)}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});

import { Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Category, Treatment } from '@/types/treatment';
import { TreatmentItem } from './TreatmentItem';

type Props = {
  selectedDate: string;
  treatments: Treatment[];
  onTreatmentPress: (treatment: Treatment) => void;
  onAddPress: () => void;
  getCategoryById: (id: string) => Category | undefined;
  dailyNoteMemo?: string;
};

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日（${weekday}）`;
}

export function DayScheduleList({
  selectedDate,
  treatments,
  onTreatmentPress,
  onAddPress,
  getCategoryById,
  dailyNoteMemo,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const sortedTreatments = [...treatments].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <ThemedText style={styles.dateTitle}>
          {formatDateHeader(selectedDate)}の予定
        </ThemedText>
        <ThemedText style={[styles.count, { color: colors.textSecondary }]}>
          {treatments.length}件
        </ThemedText>
      </View>

      <View style={styles.list}>
        {sortedTreatments.map((treatment) => (
          <TreatmentItem
            key={treatment.id}
            treatment={treatment}
            onPress={onTreatmentPress}
            getCategoryById={getCategoryById}
          />
        ))}

        {treatments.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              この日の予定はありません
            </ThemedText>
          </View>
        )}
      </View>

      {dailyNoteMemo && (
        <View style={[styles.noteSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.noteTitleRow}>
            <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
            <ThemedText style={[styles.noteTitle, { color: colors.accent }]}>
              この日の自分磨き
            </ThemedText>
          </View>
          <ThemedText style={[styles.noteText, { color: colors.text }]}>
            {dailyNoteMemo}
          </ThemedText>
        </View>
      )}

      <Pressable
        style={[
          styles.addButton,
          { backgroundColor: colors.accentLight },
        ]}
        onPress={onAddPress}
      >
        <Ionicons name="add" size={20} color={colors.accent} />
        <ThemedText style={[styles.addButtonText, { color: colors.accent }]}>
          施術予定を追加
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  count: {
    fontSize: 14,
  },
  list: {
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  noteSection: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});

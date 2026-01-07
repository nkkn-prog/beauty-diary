import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Treatment } from '@/types/treatment';

type Props = {
  treatment: Treatment;
  categoryLabel?: string;
  categoryColor?: string;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

function getDaysUntil(dateString: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function TreatmentCard({ treatment, categoryLabel, categoryColor }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isCompleted = treatment.status === 'completed';
  const daysUntil = getDaysUntil(treatment.date);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: isCompleted ? colors.success : colors.accent,
              borderColor: isCompleted ? colors.success : colors.accent,
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={10} color="#fff" />
          ) : (
            <View style={styles.innerDot} />
          )}
        </View>
        <View
          style={[
            styles.line,
            { backgroundColor: colors.border },
          ]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText
            style={[styles.date, { color: colors.textSecondary }]}
          >
            {formatDate(treatment.date)}
            {treatment.startTime && ` ${treatment.startTime}`}
          </ThemedText>
          {categoryLabel && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColor ? `${categoryColor}30` : colors.accentLight },
              ]}
            >
              <ThemedText
                style={[styles.categoryText, { color: categoryColor || colors.accent }]}
              >
                {categoryLabel}
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.name}>{treatment.title}</ThemedText>

        {treatment.location && (
          <ThemedText
            style={[styles.location, { color: colors.textSecondary }]}
          >
            {treatment.location}
          </ThemedText>
        )}

        <ThemedText
          style={[
            styles.status,
            {
              color: isCompleted ? colors.success : colors.secondary,
            },
          ]}
        >
          {isCompleted ? '完了' : daysUntil === 0 ? '今日' : daysUntil > 0 ? `あと${daysUntil}日` : `${Math.abs(daysUntil)}日前`}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
});

import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Treatment,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/types/treatment';

type Props = {
  treatment: Treatment;
  onPress: (treatment: Treatment) => void;
};

export function TreatmentItem({ treatment, onPress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const categoryColor = CATEGORY_COLORS[treatment.category];

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(treatment)}
    >
      <View
        style={[
          styles.categoryIndicator,
          { backgroundColor: categoryColor },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          {treatment.time && (
            <ThemedText style={[styles.time, { color: colors.accent }]}>
              {treatment.time}
            </ThemedText>
          )}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${categoryColor}30` },
            ]}
          >
            <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
              {CATEGORY_LABELS[treatment.category]}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.title}>{treatment.title}</ThemedText>

        {treatment.location && (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText
              style={[styles.location, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {treatment.location}
            </ThemedText>
          </View>
        )}

        {treatment.price !== undefined && (
          <View style={styles.priceRow}>
            <Ionicons
              name="wallet-outline"
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText
              style={[styles.price, { color: colors.textSecondary }]}
            >
              ¥{treatment.price.toLocaleString()}
            </ThemedText>
          </View>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    marginLeft: 4,
  },
});

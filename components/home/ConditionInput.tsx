import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ConditionLevel = 1 | 2 | 3 | 4 | 5;

type Props = {
  skinCondition?: ConditionLevel;
  bodyCondition?: ConditionLevel;
  onSkinChange: (level: ConditionLevel) => void;
  onBodyChange: (level: ConditionLevel) => void;
  onOpenDetail: () => void;
};

const CONDITION_LABELS: Record<ConditionLevel, string> = {
  1: '悪い',
  2: 'やや悪い',
  3: 'ふつう',
  4: '良い',
  5: '絶好調',
};

function ConditionBar({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value?: ConditionLevel;
  onChange: (level: ConditionLevel) => void;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.conditionRow}>
      <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <View style={styles.bars}>
        {([1, 2, 3, 4, 5] as ConditionLevel[]).map((level) => (
          <Pressable
            key={level}
            onPress={() => onChange(level)}
            style={[
              styles.bar,
              {
                backgroundColor:
                  value && level <= value ? colors.accent : colors.border,
                height: 8 + level * 4,
              },
            ]}
          />
        ))}
      </View>
      {value && (
        <ThemedText style={[styles.valueLabel, { color: colors.accent }]}>
          {CONDITION_LABELS[value]}
        </ThemedText>
      )}
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ConditionInput({
  skinCondition,
  bodyCondition,
  onSkinChange,
  onBodyChange,
  onOpenDetail,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const hasRecorded = skinCondition !== undefined || bodyCondition !== undefined;

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onOpenDetail}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name="pulse-outline"
            size={20}
            color={colors.accent}
            style={styles.icon}
          />
          <ThemedText style={styles.title}>今日のコンディション</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>

      <ConditionBar
        label="肌の調子"
        value={skinCondition}
        onChange={onSkinChange}
        colors={colors}
      />
      <ConditionBar
        label="体調"
        value={bodyCondition}
        onChange={onBodyChange}
        colors={colors}
      />

      {!hasRecorded && (
        <View
          style={[
            styles.recordButton,
            { backgroundColor: colors.accentLight },
          ]}
        >
          <Ionicons name="add" size={16} color={colors.accent} />
          <ThemedText style={[styles.recordText, { color: colors.accent }]}>
            記録する
          </ThemedText>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    width: 70,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
    width: 50,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  recordText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

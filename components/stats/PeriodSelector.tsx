import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatsPeriod } from '@/types/stats';

type Props = {
  selected: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
};

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: '3months', label: '3ヶ月' },
  { value: '6months', label: '6ヶ月' },
  { value: '1year', label: '1年' },
  { value: 'all', label: '全期間' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PeriodSelector({ selected, onChange }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {PERIODS.map((period) => {
        const isSelected = selected === period.value;
        return (
          <PeriodButton
            key={period.value}
            label={period.label}
            isSelected={isSelected}
            onPress={() => onChange(period.value)}
          />
        );
      })}
    </View>
  );
}

function PeriodButton({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <AnimatedPressable
      style={[
        styles.button,
        isSelected && { backgroundColor: colors.accent },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <ThemedText
        style={[
          styles.buttonText,
          isSelected && { color: '#FFFFFF' },
          !isSelected && { color: colors.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

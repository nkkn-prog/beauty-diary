import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type Supplement = {
  id: string;
  name: string;
  emoji?: string;
  checked: boolean;
};

type Props = {
  supplement: Supplement;
  onToggle: (id: string) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SupplementCheckItem({ supplement, onToggle }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    onToggle(supplement.id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: supplement.checked ? colors.accentLight : colors.surface,
          borderColor: supplement.checked ? colors.accent : colors.border,
        },
        animatedStyle,
      ]}
      onPress={handlePress}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: supplement.checked ? colors.success : 'transparent',
            borderColor: supplement.checked ? colors.success : colors.border,
          },
        ]}
      >
        {supplement.checked && (
          <Ionicons name="checkmark" size={14} color="#fff" />
        )}
      </View>
      <ThemedText style={styles.emoji}>{supplement.emoji || '💊'}</ThemedText>
      <ThemedText
        style={[
          styles.name,
          { color: supplement.checked ? colors.textSecondary : colors.text },
        ]}
        numberOfLines={1}
      >
        {supplement.name}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
  },
});

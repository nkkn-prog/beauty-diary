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

type Props = {
  latestComparisonDate?: Date;
  onPress: () => void;
  comingSoon?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BeforeAfterCard({ latestComparisonDate, onPress, comingSoon }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!comingSoon) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (!comingSoon) {
      scale.value = withSpring(1);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getSubtitle = () => {
    if (comingSoon) {
      return '準備中';
    }
    if (latestComparisonDate) {
      return `最新の比較: ${latestComparisonDate.getMonth() + 1}/${latestComparisonDate.getDate()}`;
    }
    return '変化を記録しよう';
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: comingSoon ? 0.6 : 1,
        },
        animatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={comingSoon ? undefined : onPress}
      disabled={comingSoon}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconBg,
              { backgroundColor: colors.accentLight },
            ]}
          >
            <Ionicons name="images-outline" size={24} color={colors.accent} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>Before / After</ThemedText>
          <ThemedText
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            {getSubtitle()}
          </ThemedText>
        </View>

        {!comingSoon && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
});

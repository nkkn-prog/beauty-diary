import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  message?: string;
};

export function EmptyStats({ message = '完了した施術がありません' }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
        <Ionicons name="bar-chart-outline" size={32} color={colors.accent} />
      </View>
      <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </ThemedText>
      <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
        施術を完了すると統計が表示されます
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
  },
});

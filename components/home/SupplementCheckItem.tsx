import { StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Supplement } from '@/types/treatment';

type Props = {
  supplement: Supplement;
};

export function SupplementCheckItem({ supplement }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const hasUrl = !!supplement.url;

  const handlePress = async () => {
    console.log('Supplement pressed:', supplement.name, 'URL:', supplement.url);
    if (supplement.url) {
      try {
        const canOpen = await Linking.canOpenURL(supplement.url);
        console.log('Can open URL:', canOpen);
        if (canOpen) {
          await Linking.openURL(supplement.url);
        }
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={handlePress}
    >
      <ThemedText style={styles.emoji}>{supplement.emoji || '💊'}</ThemedText>
      <ThemedText style={styles.name} numberOfLines={1}>
        {supplement.name}
      </ThemedText>
      {hasUrl && (
        <Ionicons
          name="link-outline"
          size={12}
          color={colors.textSecondary}
          style={styles.linkIcon}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    height: 80,
    marginRight: 10,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
  },
  linkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});

import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: typeof Colors.light;
};

function MenuItem({ icon, label, onPress, colors }: MenuItemProps) {
  return (
    <Pressable
      style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: colors.accentLight }]}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCategoriesPress = () => {
    router.push('/settings/categories');
  };

  const handleSupplementsPress = () => {
    router.push('/settings/supplements');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>マイページ</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            設定
          </ThemedText>
          <MenuItem
            icon="pricetag-outline"
            label="カテゴリ管理"
            onPress={handleCategoriesPress}
            colors={colors}
          />
          <View style={{ height: 8 }} />
          <MenuItem
            icon="medical-outline"
            label="サプリメント管理"
            onPress={handleSupplementsPress}
            colors={colors}
          />
        </View>

        <View style={styles.placeholder}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.accentLight },
            ]}
          >
            <Ionicons name="construct-outline" size={32} color={colors.accent} />
          </View>
          <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
            その他の設定は{'\n'}今後追加予定
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});

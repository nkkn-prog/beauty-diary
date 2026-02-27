import { StyleSheet, View, Pressable, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useState } from 'react';

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
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleCategoriesPress = () => {
    router.push('/settings/categories');
  };

  const handleSupplementsPress = () => {
    router.push('/settings/supplements');
  };

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await signOut({ redirectUrl: '/(auth)/sign-in' });
              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました。もう一度お試しください。');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ height: 20 }} />
      <View style={styles.header}>
        <ThemedText style={styles.title}>マイページ</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ユーザー情報 */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.accentLight }]}>
            <ThemedText style={[styles.avatarText, { color: colors.accent }]}>
              {user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?'}
            </ThemedText>
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userEmail} numberOfLines={1}>
              {user?.emailAddresses?.[0]?.emailAddress || 'ユーザー'}
            </ThemedText>
            <ThemedText style={[styles.userStatus, { color: colors.textSecondary }]}>
              ログイン中
            </ThemedText>
          </View>
        </View>

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

        {/* ログアウトボタン */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            アカウント
          </ThemedText>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.6}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <View style={[styles.menuIconContainer, { backgroundColor: colors.errorBackground }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.error} />
                </View>
                <ThemedText style={[styles.logoutText, { color: colors.error }]}>
                  ログアウト
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  userStatus: {
    fontSize: 13,
    marginTop: 2,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

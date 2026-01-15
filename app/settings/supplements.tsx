import { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SupplementEditModal } from '@/components/supplements/SupplementEditModal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSupplements } from '@/hooks/use-supplements';
import { Supplement, MAX_SUPPLEMENTS } from '@/types/treatment';

export default function SupplementsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { supplements, loading, canAddMore, add, update, remove } = useSupplements();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingSupplement(null);
    setModalVisible(true);
  };

  const handleEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setModalVisible(true);
  };

  const handleDelete = (supplement: Supplement) => {
    Alert.alert(
      'サプリメントを削除',
      `「${supplement.name}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(supplement.id);
              await remove(supplement.id);
            } catch {
              Alert.alert('エラー', '削除に失敗しました');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSave = async (name: string, emoji: string, url?: string) => {
    try {
      setSaving(true);
      if (editingSupplement) {
        await update(editingSupplement.id, { name, emoji, url });
      } else {
        await add(name, emoji, url);
      }
    } catch {
      Alert.alert('エラー', '保存に失敗しました');
      throw new Error('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'サプリメント管理',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: canAddMore
            ? () => (
                <Pressable onPress={handleAdd} hitSlop={8}>
                  <Ionicons name="add" size={28} color={colors.accent} />
                </Pressable>
              )
            : undefined,
        }}
      />

      <ThemedView style={styles.container}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
              サプリメントは最大{MAX_SUPPLEMENTS}個まで登録できます（現在{supplements.length}個）
            </ThemedText>

            <View style={styles.list}>
              {supplements.map((supplement) => (
                <View
                  key={supplement.id}
                  style={[
                    styles.supplementItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.supplementInfo}>
                    <ThemedText style={styles.emoji}>{supplement.emoji}</ThemedText>
                    <ThemedText style={styles.supplementName}>{supplement.name}</ThemedText>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => handleEdit(supplement)}
                      style={[styles.actionButton, { backgroundColor: colors.background }]}
                      hitSlop={8}
                    >
                      <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(supplement)}
                      style={[styles.actionButton, { backgroundColor: colors.background }]}
                      hitSlop={8}
                      disabled={deletingId === supplement.id}
                    >
                      {deletingId === supplement.id ? (
                        <ActivityIndicator size="small" color="#E57373" />
                      ) : (
                        <Ionicons name="trash-outline" size={18} color="#E57373" />
                      )}
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {supplements.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="medical-outline" size={48} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  サプリメントがありません
                </ThemedText>
                <Pressable
                  style={[styles.addButton, { backgroundColor: colors.accent }]}
                  onPress={handleAdd}
                >
                  <ThemedText style={styles.addButtonText}>追加する</ThemedText>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
      </ThemedView>

      <SupplementEditModal
        visible={modalVisible}
        supplement={editingSupplement}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
        saving={saving}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 13,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  supplementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  supplementName: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

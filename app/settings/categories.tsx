import { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoryEditModal } from '@/components/categories/CategoryEditModal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/use-categories';
import { Category, MAX_CATEGORIES } from '@/types/treatment';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { categories, loading, canAddMore, add, update, remove } = useCategories();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'カテゴリを削除',
      `「${category.label}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(category.id);
            } catch {
              Alert.alert('エラー', '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const handleSave = async (label: string, color: string) => {
    try {
      if (editingCategory) {
        await update(editingCategory.id, { label, color });
      } else {
        await add(label, color);
      }
    } catch {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'カテゴリ管理',
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
              カテゴリは最大{MAX_CATEGORIES}個まで作成できます（現在{categories.length}個）
            </ThemedText>

            <View style={styles.list}>
              {categories.map((category) => (
                <View
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.categoryInfo}>
                    <View
                      style={[styles.colorIndicator, { backgroundColor: category.color }]}
                    />
                    <ThemedText style={styles.categoryLabel}>{category.label}</ThemedText>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => handleEdit(category)}
                      style={[styles.actionButton, { backgroundColor: colors.background }]}
                      hitSlop={8}
                    >
                      <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(category)}
                      style={[styles.actionButton, { backgroundColor: colors.background }]}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color="#E57373" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {categories.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="pricetag-outline" size={48} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  カテゴリがありません
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

      <CategoryEditModal
        visible={modalVisible}
        category={editingCategory}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryLabel: {
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

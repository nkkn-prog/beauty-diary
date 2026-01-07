import { useState, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, View, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/use-categories';
import { useTreatments } from '@/hooks/use-treatments';
import { Treatment } from '@/types/treatment';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 'all'] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${year}/${month}/${day}（${weekday}）`;
}

function truncateName(name: string, maxLength: number = 10): string {
  if (name.length > maxLength) {
    return name.slice(0, maxLength) + '...';
  }
  return name;
}

type TreatmentItemProps = {
  treatment: Treatment;
  categoryLabel?: string;
  categoryColor?: string;
  onPress?: () => void;
};

function TreatmentItem({ treatment, categoryLabel, categoryColor, onPress }: TreatmentItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={[
        styles.itemContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.itemContent}>
        <ThemedText style={[styles.itemDate, { color: colors.textSecondary }]}>
          {formatDate(treatment.date)}
          {treatment.startTime && ` ${treatment.startTime}`}
        </ThemedText>
        <ThemedText style={styles.itemName}>
          {truncateName(treatment.title)}
        </ThemedText>
        {treatment.location && (
          <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
            {treatment.location}
          </ThemedText>
        )}
      </View>
      {categoryLabel && (
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryColor ? `${categoryColor}30` : colors.accentLight },
          ]}
        >
          <ThemedText style={[styles.categoryText, { color: categoryColor || colors.accent }]}>
            {categoryLabel}
          </ThemedText>
        </View>
      )}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
        style={styles.chevron}
      />
    </Pressable>
  );
}

export default function TreatmentListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(5);

  const { categories } = useCategories();
  const { treatments, loading, refresh } = useTreatments();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const getCategoryById = useCallback(
    (categoryId: string) => categories.find((c) => c.id === categoryId),
    [categories]
  );

  const filteredTreatments = useMemo(() => {
    let result = [...treatments];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.location && t.location.toLowerCase().includes(query))
      );
    }

    if (selectedCategoryId) {
      result = result.filter((t) => t.categoryId === selectedCategoryId);
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [treatments, searchQuery, selectedCategoryId]);

  const itemsPerPage = pageSize === 'all' ? filteredTreatments.length : pageSize;
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredTreatments.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const paginatedTreatments = pageSize === 'all'
    ? filteredTreatments
    : filteredTreatments.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(0);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const getPageSizeLabel = (size: PageSize) => {
    return size === 'all' ? '全て' : `${size}件`;
  };

  const handleTreatmentPress = (treatment: Treatment) => {
    router.push(`/treatments/${treatment.id}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen
          options={{
            title: '施術一覧',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <ActivityIndicator size="large" color={colors.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '施術一覧',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.filterSection}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="施術名・場所で検索"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearchChange('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilter}
        >
          <Pressable
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategoryId === null ? colors.accent : colors.surface,
                borderColor: selectedCategoryId === null ? colors.accent : colors.border,
              },
            ]}
            onPress={() => handleCategorySelect(null)}
          >
            <ThemedText
              style={[
                styles.categoryChipText,
                { color: selectedCategoryId === null ? '#fff' : colors.text },
              ]}
            >
              すべて
            </ThemedText>
          </Pressable>
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? category.color : colors.surface,
                    borderColor: isSelected ? category.color : colors.border,
                  },
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                {!isSelected && (
                  <View
                    style={[styles.categoryDot, { backgroundColor: category.color }]}
                  />
                )}
                <ThemedText
                  style={[
                    styles.categoryChipText,
                    { color: isSelected ? '#fff' : colors.text },
                  ]}
                >
                  {category.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.pageSizeSelector}>
          <ThemedText style={[styles.pageSizeLabel, { color: colors.textSecondary }]}>
            表示件数:
          </ThemedText>
          <View style={styles.pageSizeOptions}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.pageSizeOption,
                  {
                    backgroundColor: pageSize === size ? colors.accent : colors.surface,
                    borderColor: pageSize === size ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => handlePageSizeChange(size)}
              >
                <ThemedText
                  style={[
                    styles.pageSizeOptionText,
                    { color: pageSize === size ? '#fff' : colors.text },
                  ]}
                >
                  {getPageSizeLabel(size)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={paginatedTreatments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: totalPages > 1 && pageSize !== 'all' ? 80 : insets.bottom + 20 },
        ]}
        renderItem={({ item }) => {
          const category = getCategoryById(item.categoryId);
          return (
            <TreatmentItem
              treatment={item}
              categoryLabel={category?.label}
              categoryColor={category?.color}
              onPress={() => handleTreatmentPress(item)}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textSecondary}
            />
            <ThemedText
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              {searchQuery || selectedCategoryId
                ? '該当する施術がありません'
                : '施術の予定がありません'}
            </ThemedText>
          </View>
        }
      />
      {totalPages > 1 && pageSize !== 'all' && (
        <View
          style={[
            styles.pagination,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <Pressable
            style={[
              styles.pageButton,
              {
                backgroundColor: currentPage > 0 ? colors.accent : colors.surface,
                opacity: currentPage > 0 ? 1 : 0.5,
              },
            ]}
            onPress={handlePrevPage}
            disabled={currentPage === 0}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={currentPage > 0 ? '#fff' : colors.textSecondary}
            />
            <ThemedText
              style={[
                styles.pageButtonText,
                { color: currentPage > 0 ? '#fff' : colors.textSecondary },
              ]}
            >
              前へ
            </ThemedText>
          </Pressable>

          <ThemedText style={[styles.pageIndicator, { color: colors.textSecondary }]}>
            {currentPage + 1} / {totalPages}
          </ThemedText>

          <Pressable
            style={[
              styles.pageButton,
              {
                backgroundColor:
                  currentPage < totalPages - 1 ? colors.accent : colors.surface,
                opacity: currentPage < totalPages - 1 ? 1 : 0.5,
              },
            ]}
            onPress={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            <ThemedText
              style={[
                styles.pageButtonText,
                {
                  color:
                    currentPage < totalPages - 1 ? '#fff' : colors.textSecondary,
                },
              ]}
            >
              次へ
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={currentPage < totalPages - 1 ? '#fff' : colors.textSecondary}
            />
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  categoryFilter: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pageSizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  pageSizeLabel: {
    fontSize: 13,
    marginRight: 10,
  },
  pageSizeOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  pageSizeOption: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  pageSizeOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  pagination: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '500',
  },
});

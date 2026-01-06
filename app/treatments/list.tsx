import { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View, Pressable, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/use-categories';
import { type Treatment } from '@/components/home';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 'all'] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

// TODO: Replace with actual data from storage/API
const TREATMENTS: Treatment[] = [
  {
    id: '1',
    name: '眉毛サロン',
    date: new Date('2024-12-28'),
    status: 'completed',
    category: 'フェイス',
    place: '銀座店',
  },
  {
    id: '2',
    name: 'ポテンツァ',
    date: new Date('2025-01-15'),
    status: 'scheduled',
    category: '肌治療',
    place: '渋谷クリニック',
  },
  {
    id: '3',
    name: '医療脱毛',
    date: new Date('2025-01-20'),
    status: 'scheduled',
    category: 'ボディ',
    place: '新宿院',
  },
  {
    id: '4',
    name: 'フェイシャルエステ（毛穴ケアコース）',
    date: new Date('2025-02-01'),
    status: 'scheduled',
    category: 'フェイス',
    place: '銀座店',
  },
  {
    id: '5',
    name: 'ハイフ',
    date: new Date('2025-02-15'),
    status: 'scheduled',
    category: '肌治療',
    place: '渋谷クリニック',
  },
  {
    id: '6',
    name: 'ハイフ',
    date: new Date('2025-02-15'),
    status: 'scheduled',
    category: '肌治療',
    place: '表参道店',
  },
  {
    id: '7',
    name: 'ハイフ',
    date: new Date('2025-02-15'),
    status: 'scheduled',
    category: '肌治療',
    place: '渋谷クリニック',
  },
  {
    id: '8',
    name: 'ハイフ',
    date: new Date('2025-02-15'),
    status: 'scheduled',
    category: '肌治療',
    place: '新宿院',
  },
];

function formatDate(date: Date): string {
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
  onPress?: () => void;
};

function TreatmentItem({ treatment, onPress }: TreatmentItemProps) {
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
        </ThemedText>
        <ThemedText style={styles.itemName}>
          {truncateName(treatment.name)}
        </ThemedText>
      </View>
      {treatment.category && (
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: colors.accentLight },
          ]}
        >
          <ThemedText style={[styles.categoryText, { color: colors.accent }]}>
            {treatment.category}
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
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(5);

  // Get categories from category management
  const { categories } = useCategories();

  // Filter and sort treatments
  const filteredTreatments = useMemo(() => {
    let result = [...TREATMENTS];

    // Filter by search query (name or place)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.place && t.place.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Sort by date descending (future first)
    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [searchQuery, selectedCategory]);

  // Pagination logic
  const itemsPerPage = pageSize === 'all' ? filteredTreatments.length : pageSize;
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredTreatments.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const paginatedTreatments = pageSize === 'all'
    ? filteredTreatments
    : filteredTreatments.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(0);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
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
    // TODO: Navigate to treatment detail
    console.log('Treatment pressed:', treatment.id);
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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '施術一覧',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {/* Search and Filter Section */}
      <View style={styles.filterSection}>
        {/* Search Bar */}
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

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilter}
        >
          <Pressable
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === null ? colors.accent : colors.surface,
                borderColor: selectedCategory === null ? colors.accent : colors.border,
              },
            ]}
            onPress={() => handleCategorySelect(null)}
          >
            <ThemedText
              style={[
                styles.categoryChipText,
                { color: selectedCategory === null ? '#fff' : colors.text },
              ]}
            >
              すべて
            </ThemedText>
          </Pressable>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.label;
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
                onPress={() => handleCategorySelect(category.label)}
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

        {/* Page Size Selector */}
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
        renderItem={({ item }) => (
          <TreatmentItem
            treatment={item}
            onPress={() => handleTreatmentPress(item)}
          />
        )}
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
              {searchQuery || selectedCategory
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

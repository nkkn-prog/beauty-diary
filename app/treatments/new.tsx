import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  TreatmentCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/types/treatment';

const CATEGORIES: TreatmentCategory[] = [
  'facial',
  'skin',
  'hair',
  'body',
  'eyebrow',
  'nail',
  'other',
];

function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}

export default function NewTreatmentScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<TreatmentCategory>('skin');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handlePriceChange = (text: string) => {
    // Only allow half-width digits (0-9)
    const filtered = text.replace(/[^0-9]/g, '');
    setPrice(filtered);
  };

  const handleSave = () => {
    if (!title.trim()) {
      // TODO: Show validation error
      return;
    }

    const newTreatment = {
      id: Date.now().toString(),
      title: title.trim(),
      date: selectedDate,
      time: time || undefined,
      location: location.trim() || undefined,
      category,
      price: price ? parseInt(price, 10) : undefined,
      notes: notes.trim() || undefined,
      status: 'scheduled' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('New treatment:', newTreatment);
    // TODO: Save to storage
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '施術予定を追加',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={!title.trim()}
              hitSlop={8}
            >
              <ThemedText
                style={[
                  styles.saveButton,
                  {
                    color: title.trim() ? colors.accent : colors.textSecondary,
                  },
                ]}
              >
                保存
              </ThemedText>
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Input */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                施術名 *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="例: ポテンツァ、医療脱毛"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Date */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                日付
              </ThemedText>
              <Pressable
                style={[
                  styles.input,
                  styles.dateInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <ThemedText style={styles.dateText}>
                  {formatDateForDisplay(selectedDate)}
                </ThemedText>
              </Pressable>
            </View>

            {/* Time Input */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                時間
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={time}
                onChangeText={setTime}
                placeholder="例: 14:00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Category */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                カテゴリ
              </ThemedText>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          category === cat
                            ? `${CATEGORY_COLORS[cat]}30`
                            : colors.surface,
                        borderColor:
                          category === cat
                            ? CATEGORY_COLORS[cat]
                            : colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: CATEGORY_COLORS[cat] },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.categoryText,
                        {
                          color:
                            category === cat
                              ? CATEGORY_COLORS[cat]
                              : colors.text,
                        },
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Location Input */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                場所
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={location}
                onChangeText={setLocation}
                placeholder="例: 渋谷美容クリニック"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Price Input */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                金額
              </ThemedText>
              <View
                style={[
                  styles.input,
                  styles.priceInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ThemedText style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                  ¥
                </ThemedText>
                <TextInput
                  style={[styles.priceTextInput, { color: colors.text }]}
                  value={price}
                  onChangeText={handlePriceChange}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                メモ
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.notesInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="施術に関するメモ"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 4,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
});

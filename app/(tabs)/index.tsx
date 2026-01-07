import { useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  SupplementCheckItem,
  TreatmentCard,
  DailyNoteInput,
  BeforeAfterCard,
  SectionHeader,
  EmptySupplementCard,
  SupplementAddButton,
} from '@/components/home';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSupplements } from '@/hooks/use-supplements';
import { useTreatments } from '@/hooks/use-treatments';
import { useCategories } from '@/hooks/use-categories';
import { useDailyNotes } from '@/hooks/use-daily-notes';

const REFRESH_THROTTLE_MS = 5000; // 5秒間隔でリフレッシュ

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'おはようございます';
  if (hour < 18) return 'こんにちは';
  return 'こんばんは';
}

function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}曜日`;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { supplements, refresh: refreshSupplements } = useSupplements();
  const { refresh: refreshTreatments, getUpcoming } = useTreatments();
  const { getCategoryById } = useCategories();
  const { getByDate, save: saveDailyNote, refresh: refreshDailyNotes } = useDailyNotes();
  const [savingNote, setSavingNote] = useState(false);
  const lastRefreshTime = useRef<number>(0);

  const today = getToday();
  const todayNote = getByDate(today);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastRefreshTime.current < REFRESH_THROTTLE_MS) {
        return;
      }
      lastRefreshTime.current = now;
      refreshTreatments();
      refreshSupplements();
      refreshDailyNotes();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleSaveDailyNote = async (memo: string) => {
    setSavingNote(true);
    try {
      await saveDailyNote(today, memo);
    } finally {
      setSavingNote(false);
    }
  };

  const upcomingTreatments = getUpcoming(5);

  const handleOpenBeforeAfter = () => {
    console.log('Open before/after');
  };

  const handleAddSupplement = () => {
    router.push('/settings/supplements');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ height: 20 }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(new Date())}
            </ThemedText>
            <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
          </View>
          <View style={styles.headerIcons}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              hitSlop={8}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Today's Message */}
        <View
          style={[
            styles.messageCard,
            { backgroundColor: colors.accentLight },
          ]}
        >
          <ThemedText style={[styles.messageText, { color: colors.accent }]}>
            今日も自分磨きを楽しもう
          </ThemedText>
        </View>

        {/* Daily Note Input */}
        <DailyNoteInput
          date={today}
          initialMemo={todayNote?.memo}
          onSave={handleSaveDailyNote}
          saving={savingNote}
        />

        {/* Supplements Section */}
        <View style={styles.section}>
          <SectionHeader
            icon="medical-outline"
            title="サプリメント一覧"
            actionLabel={supplements.length > 0 ? '編集' : undefined}
            onAction={supplements.length > 0 ? handleAddSupplement : undefined}
          />
          {supplements.length > 0 ? (
            <FlatList
              data={supplements}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.supplementList}
              renderItem={({ item }) => (
                <SupplementCheckItem supplement={item} />
              )}
              ListFooterComponent={
                <SupplementAddButton onPress={handleAddSupplement} />
              }
            />
          ) : (
            <EmptySupplementCard onPress={handleAddSupplement} />
          )}
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <SectionHeader
            icon="calendar-outline"
            title="スケジュール"
            actionLabel="すべて見る"
            onAction={() => router.push('/treatments/list')}
          />
          {upcomingTreatments.length === 0 ? (
            <View style={[styles.emptyTimeline, { backgroundColor: colors.surface }]}>
              <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
              <ThemedText style={[styles.emptyTimelineText, { color: colors.textSecondary }]}>
                施術予定はありません
              </ThemedText>
            </View>
          ) : (
            upcomingTreatments.map((treatment) => {
              const category = getCategoryById(treatment.categoryId);
              return (
                <TreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  categoryLabel={category?.label}
                  categoryColor={category?.color}
                />
              );
            })
          )}
        </View>

        {/* Before/After Section */}
        <View style={styles.section}>
          <SectionHeader icon="images-outline" title="記録" />
          <BeforeAfterCard
            onPress={handleOpenBeforeAfter}
            comingSoon
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {/* <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: colors.accent,
            bottom: insets.bottom + 80,
          },
        ]}
        onPress={handleAddTreatment}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  date: {
    fontSize: 13,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  emptyTimeline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 12,
    gap: 8,
  },
  emptyTimelineText: {
    fontSize: 14,
  },
  supplementList: {
    paddingRight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

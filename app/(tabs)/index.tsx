import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  SupplementCheckItem,
  TreatmentCard,
  ConditionInput,
  BeforeAfterCard,
  SectionHeader,
  EmptySupplementCard,
  SupplementAddButton,
  type Treatment,
} from '@/components/home';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSupplements } from '@/hooks/use-supplements';

const TREATMENTS: Treatment[] = [
  {
    id: '1',
    name: '眉毛サロン',
    date: new Date('2024-12-28'),
    status: 'completed',
    category: 'フェイス',
  },
  {
    id: '2',
    name: 'ポテンツァ',
    date: new Date('2025-01-15'),
    status: 'scheduled',
    category: '肌治療',
  },
  {
    id: '3',
    name: '医療脱毛',
    date: new Date('2025-01-20'),
    status: 'scheduled',
    category: 'ボディ',
  },
];

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

type ConditionLevel = 1 | 2 | 3 | 4 | 5;

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { supplements } = useSupplements();
  const [skinCondition, setSkinCondition] = useState<ConditionLevel | undefined>();
  const [bodyCondition, setBodyCondition] = useState<ConditionLevel | undefined>();

  const handleOpenConditionDetail = () => {
    // Navigate to condition detail screen
    console.log('Open condition detail');
  };

  const handleOpenBeforeAfter = () => {
    // Navigate to before/after screen
    console.log('Open before/after');
  };

  const handleAddTreatment = () => {
    // Navigate to add treatment screen
    console.log('Add treatment');
  };

  const handleAddSupplement = () => {
    router.push('/settings/supplements');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
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

        {/* Condition Input */}
        <ConditionInput
          skinCondition={skinCondition}
          bodyCondition={bodyCondition}
          onSkinChange={setSkinCondition}
          onBodyChange={setBodyCondition}
          onOpenDetail={handleOpenConditionDetail}
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
            title="施術タイムライン"
            actionLabel="すべて見る"
            onAction={() => router.push('/treatments/list')}
          />
          {TREATMENTS
            .filter((treatment) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return treatment.date >= today;
            })
            .slice(0, 5)
            .map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
        </View>

        {/* Before/After Section */}
        <View style={styles.section}>
          <SectionHeader icon="images-outline" title="記録" />
          <BeforeAfterCard
            latestComparisonDate={new Date('2024-12-20')}
            onPress={handleOpenBeforeAfter}
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
    </ThemedView>
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

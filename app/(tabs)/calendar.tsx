import { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DayScheduleList } from '@/components/calendar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/use-categories';
import { useTreatments } from '@/hooks/use-treatments';
import { useDailyNotes } from '@/hooks/use-daily-notes';
import { Treatment } from '@/types/treatment';

// Japanese locale configuration
LocaleConfig.locales['ja'] = {
  monthNames: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日',
};
LocaleConfig.defaultLocale = 'ja';

function getToday(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { categories, getCategoryById } = useCategories();
  const { treatments, refresh: refreshTreatments } = useTreatments();
  const { getByDate, refresh: refreshDailyNotes } = useDailyNotes();

  const [selectedDate, setSelectedDate] = useState(getToday());

  const selectedDateNote = getByDate(selectedDate);

  useFocusEffect(
    useCallback(() => {
      refreshTreatments();
      refreshDailyNotes();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Group treatments by date for calendar markers
  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: { key: string; color: string }[]; selected?: boolean; selectedColor?: string }> = {};

    treatments.forEach((t) => {
      if (!marks[t.date]) {
        marks[t.date] = { dots: [] };
      }
      const category = getCategoryById(t.categoryId);
      marks[t.date].dots.push({
        key: t.id,
        color: category?.color || '#C4C4C4',
      });
    });

    // Add selected date styling
    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: colors.accent,
      };
    } else {
      marks[selectedDate] = {
        dots: [],
        selected: true,
        selectedColor: colors.accent,
      };
    }

    return marks;
  }, [treatments, selectedDate, colors.accent, getCategoryById]);

  // Get treatments for selected date
  const selectedDateTreatments = useMemo(() => {
    return treatments.filter((t) => t.date === selectedDate);
  }, [treatments, selectedDate]);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleTreatmentPress = (treatment: Treatment) => {
    router.push(`/treatments/${treatment.id}`);
  };

  const handleAddPress = () => {
    if (categories.length === 0) {
      Alert.alert(
        'カテゴリがありません',
        '施術予定を追加するにはカテゴリが必要です。マイページからカテゴリを追加してください。',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'マイページへ',
            onPress: () => router.push('/(tabs)/profile'),
          },
        ]
      );
      return;
    }
    router.push({
      pathname: '/treatments/new',
      params: { date: selectedDate },
    });
  };

  const calendarTheme = {
    backgroundColor: colors.background,
    calendarBackground: colors.background,
    textSectionTitleColor: colors.textSecondary,
    selectedDayBackgroundColor: colors.accent,
    selectedDayTextColor: '#ffffff',
    todayTextColor: colors.accent,
    dayTextColor: colors.text,
    textDisabledColor: colors.border,
    dotColor: colors.accent,
    selectedDotColor: '#ffffff',
    arrowColor: colors.accent,
    monthTextColor: colors.text,
    textDayFontWeight: '400' as const,
    textMonthFontWeight: '600' as const,
    textDayHeaderFontWeight: '500' as const,
    textDayFontSize: 15,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 13,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ height: 20 }} />
      <View style={styles.header}>
        <ThemedText style={styles.title}>カレンダー</ThemedText>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markingType="multi-dot"
        markedDates={markedDates}
        theme={calendarTheme}
        firstDay={0}
        enableSwipeMonths
        style={styles.calendar}
      />

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border },
        ]}
      />

      <DayScheduleList
        selectedDate={selectedDate}
        treatments={selectedDateTreatments}
        onTreatmentPress={handleTreatmentPress}
        onAddPress={handleAddPress}
        getCategoryById={getCategoryById}
        dailyNoteMemo={selectedDateNote?.memo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  calendar: {
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginTop: 8,
  },
});

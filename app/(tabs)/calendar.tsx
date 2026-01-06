import { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DayScheduleList } from '@/components/calendar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Treatment, CATEGORY_COLORS } from '@/types/treatment';

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

// Mock data
const MOCK_TREATMENTS: Treatment[] = [
  {
    id: '1',
    title: 'ポテンツァ',
    date: '2025-01-15',
    startTime: '14:00',
    endTime: '15:00',
    location: '渋谷美容クリニック',
    category: 'skin',
    price: 55000,
    status: 'scheduled',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: '医療脱毛（全身）',
    date: '2025-01-20',
    startTime: '11:00',
    endTime: '12:30',
    location: '銀座レーザークリニック',
    category: 'hair',
    price: 120000,
    status: 'scheduled',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: '眉毛サロン',
    date: '2025-01-15',
    startTime: '16:30',
    endTime: '17:00',
    location: '表参道サロン',
    category: 'eyebrow',
    price: 6500,
    status: 'scheduled',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'フェイシャルエステ',
    date: '2025-01-28',
    startTime: '13:00',
    endTime: '14:00',
    category: 'facial',
    price: 15000,
    status: 'scheduled',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

function getToday(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [treatments] = useState<Treatment[]>(MOCK_TREATMENTS);

  // Group treatments by date for calendar markers
  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: Array<{ key: string; color: string }>; selected?: boolean; selectedColor?: string }> = {};

    treatments.forEach((t) => {
      if (!marks[t.date]) {
        marks[t.date] = { dots: [] };
      }
      marks[t.date].dots.push({
        key: t.id,
        color: CATEGORY_COLORS[t.category],
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
  }, [treatments, selectedDate, colors.accent]);

  // Get treatments for selected date
  const selectedDateTreatments = useMemo(() => {
    return treatments.filter((t) => t.date === selectedDate);
  }, [treatments, selectedDate]);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleTreatmentPress = (treatment: Treatment) => {
    console.log('Treatment pressed:', treatment.id);
    // TODO: Navigate to treatment detail
  };

  const handleAddPress = () => {
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
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
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
      />
    </ThemedView>
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
    fontSize: 28,
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

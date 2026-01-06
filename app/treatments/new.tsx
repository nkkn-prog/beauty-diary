import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualTimeText, setManualTimeText] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<TreatmentCategory>('skin');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handlePriceChange = (text: string) => {
    // Only allow half-width digits (0-9)
    const filtered = text.replace(/[^0-9]/g, '');
    setPrice(filtered);
  };

  const formatTimeForDisplay = (date: Date | null): string => {
    if (!date) return '未設定';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTimeForSave = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseManualTime = (text: string): Date | null => {
    const match = text.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleManualTimeInput = (text: string) => {
    const newDigits = text.replace(/[^\d]/g, '');

    // Check if deleting by comparing text length (including colon)
    const isDeleting = text.length < manualTimeText.length;

    if (isDeleting) {
      // When deleting, remove last digit
      const prevDigits = manualTimeText.replace(/:/g, '');
      const deletedDigits = prevDigits.slice(0, -1);

      if (deletedDigits.length <= 2) {
        setManualTimeText(deletedDigits);
      } else {
        setManualTimeText(deletedDigits.slice(0, 2) + ':' + deletedDigits.slice(2, 4));
      }
      return;
    } else {
      // Validate and format
      let hours = newDigits.slice(0, 2);
      let minutes = newDigits.slice(2, 4);

      // Validate hours (0-23)
      if (hours.length === 2) {
        const h = parseInt(hours, 10);
        if (h > 23) {
          hours = '23';
        }
      } else if (hours.length === 1) {
        const h = parseInt(hours, 10);
        if (h > 2) {
          // If first digit is 3-9, auto-pad with 0 (e.g., "3" -> "03")
          hours = '0' + hours;
        }
      }

      // Validate minutes (0-59)
      if (minutes.length >= 1) {
        const firstMinuteDigit = parseInt(minutes[0], 10);
        if (firstMinuteDigit > 5) {
          minutes = '5' + (minutes[1] || '');
        }
        if (minutes.length === 2) {
          const m = parseInt(minutes, 10);
          if (m > 59) {
            minutes = '59';
          }
        }
      }

      const validatedDigits = hours + minutes;

      // Auto-insert colon after 2 digits
      if (validatedDigits.length >= 2) {
        setManualTimeText(validatedDigits.slice(0, 2) + ':' + validatedDigits.slice(2, 4));
      } else {
        setManualTimeText(validatedDigits);
      }
    }
  };

  const handleStartTimePress = () => {
    setTempTime(startTime || new Date());
    setManualTimeText(startTime ? formatTimeForDisplay(startTime) : '');
    setIsManualInput(false);
    setShowStartPicker(true);
  };

  const handleEndTimePress = () => {
    setTempTime(endTime || startTime || new Date());
    setManualTimeText(endTime ? formatTimeForDisplay(endTime) : '');
    setIsManualInput(false);
    setShowEndPicker(true);
  };

  const toggleManualInput = () => {
    if (!isManualInput) {
      setManualTimeText(formatTimeForDisplay(tempTime));
    }
    setIsManualInput(!isManualInput);
  };

  const handleStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      if (event.type === 'set' && selectedTime) {
        setStartTime(selectedTime);
      }
    } else if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
      if (event.type === 'set' && selectedTime) {
        setEndTime(selectedTime);
      }
    } else if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const confirmStartTime = () => {
    if (isManualInput) {
      const parsed = parseManualTime(manualTimeText);
      if (parsed) {
        setStartTime(parsed);
      }
    } else {
      setStartTime(tempTime);
    }
    setShowStartPicker(false);
    setIsManualInput(false);
  };

  const confirmEndTime = () => {
    if (isManualInput) {
      const parsed = parseManualTime(manualTimeText);
      if (parsed) {
        setEndTime(parsed);
      }
    } else {
      setEndTime(tempTime);
    }
    setShowEndPicker(false);
    setIsManualInput(false);
  };

  const clearStartTime = () => {
    setStartTime(null);
    setShowStartPicker(false);
    setIsManualInput(false);
  };

  const clearEndTime = () => {
    setEndTime(null);
    setShowEndPicker(false);
    setIsManualInput(false);
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
      startTime: formatTimeForSave(startTime),
      endTime: formatTimeForSave(endTime),
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
              <View style={styles.timeRow}>
                <View style={styles.timeColumn}>
                  <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>
                    開始
                  </ThemedText>
                  <Pressable
                    style={[
                      styles.input,
                      styles.timeInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleStartTimePress}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                    <ThemedText
                      style={[
                        styles.timeText,
                        { color: startTime ? colors.text : colors.textSecondary },
                      ]}
                    >
                      {formatTimeForDisplay(startTime)}
                    </ThemedText>
                  </Pressable>
                </View>
                <ThemedText style={[styles.timeSeparator, { color: colors.textSecondary }]}>
                  〜
                </ThemedText>
                <View style={styles.timeColumn}>
                  <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>
                    終了
                  </ThemedText>
                  <Pressable
                    style={[
                      styles.input,
                      styles.timeInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleEndTimePress}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                    <ThemedText
                      style={[
                        styles.timeText,
                        { color: endTime ? colors.text : colors.textSecondary },
                      ]}
                    >
                      {formatTimeForDisplay(endTime)}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
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

      {/* Start Time Picker Modal (iOS) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showStartPicker}
          transparent
          animationType="slide"
        >
          <View style={[styles.modalOverlay, isManualInput && styles.modalOverlayCenter]}>
            <View style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
              isManualInput && styles.modalContentCenter,
            ]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={clearStartTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.textSecondary }]}>
                    クリア
                  </ThemedText>
                </Pressable>
                <ThemedText style={styles.modalTitle}>開始時刻</ThemedText>
                <Pressable onPress={confirmStartTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.accent }]}>
                    完了
                  </ThemedText>
                </Pressable>
              </View>
              <Pressable
                style={[styles.manualToggle, { backgroundColor: colors.background }]}
                onPress={toggleManualInput}
              >
                <Ionicons
                  name={isManualInput ? 'time-outline' : 'keypad-outline'}
                  size={16}
                  color={colors.accent}
                />
                <ThemedText style={[styles.manualToggleText, { color: colors.accent }]}>
                  {isManualInput ? 'ピッカーで選択' : '手入力'}
                </ThemedText>
              </Pressable>
              <View style={styles.pickerContainer}>
                {isManualInput ? (
                  <TextInput
                    style={[
                      styles.manualInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={manualTimeText}
                    onChangeText={handleManualTimeInput}
                    placeholder="00:00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={5}
                  />
                ) : (
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="spinner"
                    onChange={handleStartTimeChange}
                    locale="ja"
                    minuteInterval={5}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* End Time Picker Modal (iOS) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showEndPicker}
          transparent
          animationType="slide"
        >
          <View style={[styles.modalOverlay, isManualInput && styles.modalOverlayCenter]}>
            <View style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
              isManualInput && styles.modalContentCenter,
            ]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={clearEndTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.textSecondary }]}>
                    クリア
                  </ThemedText>
                </Pressable>
                <ThemedText style={styles.modalTitle}>終了時刻</ThemedText>
                <Pressable onPress={confirmEndTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.accent }]}>
                    完了
                  </ThemedText>
                </Pressable>
              </View>
              <Pressable
                style={[styles.manualToggle, { backgroundColor: colors.background }]}
                onPress={toggleManualInput}
              >
                <Ionicons
                  name={isManualInput ? 'time-outline' : 'keypad-outline'}
                  size={16}
                  color={colors.accent}
                />
                <ThemedText style={[styles.manualToggleText, { color: colors.accent }]}>
                  {isManualInput ? 'ピッカーで選択' : '手入力'}
                </ThemedText>
              </Pressable>
              <View style={styles.pickerContainer}>
                {isManualInput ? (
                  <TextInput
                    style={[
                      styles.manualInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={manualTimeText}
                    onChangeText={handleManualTimeInput}
                    placeholder="00:00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={5}
                  />
                ) : (
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="spinner"
                    onChange={handleEndTimeChange}
                    locale="ja"
                    minuteInterval={5}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Time Pickers */}
      {Platform.OS === 'android' && showStartPicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="spinner"
          onChange={handleStartTimeChange}
          minuteInterval={5}
        />
      )}
      {Platform.OS === 'android' && showEndPicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="spinner"
          onChange={handleEndTimeChange}
          minuteInterval={5}
        />
      )}
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    marginLeft: 10,
  },
  timeSeparator: {
    fontSize: 16,
    paddingBottom: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalOverlayCenter: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalContentCenter: {
    borderRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    alignItems: 'center',
  },
  manualToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  manualToggleText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  manualInput: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    width: 180,
    letterSpacing: 4,
  },
});

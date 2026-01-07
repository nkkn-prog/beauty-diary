import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/use-categories';
import { useTreatments } from '@/hooks/use-treatments';
import { useGoogleCalendar } from '@/hooks/use-google-calendar';
import { useToast } from '@/contexts/toast-context';
import { Treatment, TreatmentStatus } from '@/types/treatment';
import { getGoogleCalendarErrorMessage } from '@/utils/google-calendar';

function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}

function parseTimeString(timeString?: string): Date | null {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export default function EditTreatmentScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    loading: treatmentsLoading,
    getTreatmentById,
    update: updateTreatment,
    remove: deleteTreatment,
  } = useTreatments();
  const { showToast } = useToast();
  const { addTreatmentToCalendar, isAdding, isGoogleUser, promptGoogleLogin } =
    useGoogleCalendar();

  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualTimeText, setManualTimeText] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TreatmentStatus>('scheduled');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (treatmentsLoading || !id) return;

    const data = getTreatmentById(id);
    if (data) {
      setTreatment(data);
      setTitle(data.title);
      setSelectedDate(data.date);
      setStartTime(parseTimeString(data.startTime));
      setEndTime(parseTimeString(data.endTime));
      setLocation(data.location || '');
      setCategoryId(data.categoryId);
      setPrice(data.price?.toString() || '');
      setNotes(data.notes || '');
      setStatus(data.status);
    }
  }, [id, treatmentsLoading, getTreatmentById]);

  const handlePriceChange = (text: string) => {
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
    const isDeleting = text.length < manualTimeText.length;

    if (isDeleting) {
      const prevDigits = manualTimeText.replace(/:/g, '');
      const deletedDigits = prevDigits.slice(0, -1);

      if (deletedDigits.length <= 2) {
        setManualTimeText(deletedDigits);
      } else {
        setManualTimeText(deletedDigits.slice(0, 2) + ':' + deletedDigits.slice(2, 4));
      }
      return;
    } else {
      let hours = newDigits.slice(0, 2);
      let minutes = newDigits.slice(2, 4);

      if (hours.length === 2) {
        const h = parseInt(hours, 10);
        if (h > 23) hours = '23';
      } else if (hours.length === 1) {
        const h = parseInt(hours, 10);
        if (h > 2) hours = '0' + hours;
      }

      if (minutes.length >= 1) {
        const firstMinuteDigit = parseInt(minutes[0], 10);
        if (firstMinuteDigit > 5) minutes = '5' + (minutes[1] || '');
        if (minutes.length === 2) {
          const m = parseInt(minutes, 10);
          if (m > 59) minutes = '59';
        }
      }

      const validatedDigits = hours + minutes;
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
      if (parsed) setStartTime(parsed);
    } else {
      setStartTime(tempTime);
    }
    setShowStartPicker(false);
    setIsManualInput(false);
  };

  const confirmEndTime = () => {
    if (isManualInput) {
      const parsed = parseManualTime(manualTimeText);
      if (parsed) setEndTime(parsed);
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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', '施術名を入力してください');
      return;
    }

    if (saving || !id) return;

    try {
      setSaving(true);
      await updateTreatment(id, {
        title: title.trim(),
        date: selectedDate,
        startTime: formatTimeForSave(startTime),
        endTime: formatTimeForSave(endTime),
        location: location.trim() || undefined,
        categoryId: categoryId || categories[0]?.id,
        price: price ? parseInt(price, 10) : undefined,
        notes: notes.trim() || undefined,
        status,
      });
      showToast({ message: '保存しました', type: 'success' });
      router.replace('/(tabs)/calendar');
    } catch (error) {
      console.error('Failed to save treatment:', error);
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '施術を削除',
      'この施術を削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteTreatment(id);
              showToast({ message: '削除しました', type: 'success' });
              router.replace('/(tabs)/calendar');
            } catch (error) {
              console.error('Failed to delete treatment:', error);
              Alert.alert('エラー', '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    router.back();
  };

  const handleAddToCalendar = async () => {
    if (!treatment || isAdding) return;

    if (!isGoogleUser) {
      promptGoogleLogin();
      return;
    }

    const result = await addTreatmentToCalendar(treatment);

    if (result.success) {
      showToast({ message: 'Google Calendarに追加しました', type: 'success' });
    } else {
      const message = getGoogleCalendarErrorMessage(result.error ?? 'unknown_error');
      Alert.alert('エラー', message);
    }
  };

  if (treatmentsLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen
          options={{
            title: '施術を編集',
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <ActivityIndicator size="large" color={colors.accent} />
      </ThemedView>
    );
  }

  if (!treatment) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen
          options={{
            title: '施術を編集',
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <ThemedText>施術が見つかりません</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '施術を編集',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={!title.trim() || saving}
              hitSlop={8}
            >
              <ThemedText
                style={[
                  styles.saveButton,
                  { color: title.trim() && !saving ? colors.accent : colors.textSecondary },
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
            {/* Status */}
            <View style={styles.section}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                ステータス
              </ThemedText>
              <View style={styles.statusGrid}>
                {(['scheduled', 'completed', 'cancelled'] as TreatmentStatus[]).map((s) => {
                  const isSelected = status === s;
                  const labels: Record<TreatmentStatus, string> = {
                    scheduled: '予定',
                    completed: '完了',
                    cancelled: 'キャンセル',
                  };
                  return (
                    <Pressable
                      key={s}
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor: isSelected ? colors.accent : colors.surface,
                          borderColor: isSelected ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => setStatus(s)}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: isSelected ? '#fff' : colors.text },
                        ]}
                      >
                        {labels[s]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

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
              {categoriesLoading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.categoryButton,
                          {
                            backgroundColor: isSelected ? `${cat.color}30` : colors.surface,
                            borderColor: isSelected ? cat.color : colors.border,
                          },
                        ]}
                        onPress={() => setCategoryId(cat.id)}
                      >
                        <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                        <ThemedText
                          style={[
                            styles.categoryText,
                            { color: isSelected ? cat.color : colors.text },
                          ]}
                        >
                          {cat.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
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

            {/* Calendar Button */}
            <View style={styles.section}>
              <Pressable
                style={[styles.calendarButton, { borderColor: colors.accent }]}
                onPress={handleAddToCalendar}
                disabled={isAdding}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={isAdding ? colors.textSecondary : colors.accent}
                />
                <ThemedText
                  style={[
                    styles.calendarButtonText,
                    { color: isAdding ? colors.textSecondary : colors.accent },
                  ]}
                >
                  {isAdding ? '追加中...' : 'Google Calendarに追加'}
                </ThemedText>
              </Pressable>
            </View>

            {/* Delete Button */}
            <View style={styles.section}>
              <Pressable
                style={[styles.deleteButton, { borderColor: colors.error }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <ThemedText style={[styles.deleteButtonText, { color: colors.error }]}>
                  この施術を削除
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>

      {/* Time Picker Modals */}
      {Platform.OS === 'ios' && (
        <Modal visible={showStartPicker} transparent animationType="slide">
          <View style={[styles.modalOverlay, isManualInput && styles.modalOverlayCenter]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }, isManualInput && styles.modalContentCenter]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={clearStartTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.textSecondary }]}>クリア</ThemedText>
                </Pressable>
                <ThemedText style={styles.modalTitle}>開始時刻</ThemedText>
                <Pressable onPress={confirmStartTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.accent }]}>完了</ThemedText>
                </Pressable>
              </View>
              <Pressable style={[styles.manualToggle, { backgroundColor: colors.background }]} onPress={toggleManualInput}>
                <Ionicons name={isManualInput ? 'time-outline' : 'keypad-outline'} size={16} color={colors.accent} />
                <ThemedText style={[styles.manualToggleText, { color: colors.accent }]}>
                  {isManualInput ? 'ピッカーで選択' : '手入力'}
                </ThemedText>
              </Pressable>
              <View style={styles.pickerContainer}>
                {isManualInput ? (
                  <TextInput
                    style={[styles.manualInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={manualTimeText}
                    onChangeText={handleManualTimeInput}
                    placeholder="00:00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={5}
                  />
                ) : (
                  <DateTimePicker value={tempTime} mode="time" display="spinner" onChange={handleStartTimeChange} locale="ja" minuteInterval={5} />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={showEndPicker} transparent animationType="slide">
          <View style={[styles.modalOverlay, isManualInput && styles.modalOverlayCenter]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }, isManualInput && styles.modalContentCenter]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={clearEndTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.textSecondary }]}>クリア</ThemedText>
                </Pressable>
                <ThemedText style={styles.modalTitle}>終了時刻</ThemedText>
                <Pressable onPress={confirmEndTime} hitSlop={8}>
                  <ThemedText style={[styles.modalButton, { color: colors.accent }]}>完了</ThemedText>
                </Pressable>
              </View>
              <Pressable style={[styles.manualToggle, { backgroundColor: colors.background }]} onPress={toggleManualInput}>
                <Ionicons name={isManualInput ? 'time-outline' : 'keypad-outline'} size={16} color={colors.accent} />
                <ThemedText style={[styles.manualToggleText, { color: colors.accent }]}>
                  {isManualInput ? 'ピッカーで選択' : '手入力'}
                </ThemedText>
              </Pressable>
              <View style={styles.pickerContainer}>
                {isManualInput ? (
                  <TextInput
                    style={[styles.manualInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={manualTimeText}
                    onChangeText={handleManualTimeInput}
                    placeholder="00:00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={5}
                  />
                ) : (
                  <DateTimePicker value={tempTime} mode="time" display="spinner" onChange={handleEndTimeChange} locale="ja" minuteInterval={5} />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && showStartPicker && (
        <DateTimePicker value={tempTime} mode="time" display="spinner" onChange={handleStartTimeChange} minuteInterval={5} />
      )}
      {Platform.OS === 'android' && showEndPicker && (
        <DateTimePicker value={tempTime} mode="time" display="spinner" onChange={handleEndTimeChange} minuteInterval={5} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  dateInput: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 16, marginLeft: 10 },
  priceInput: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 16, marginRight: 4 },
  priceTextInput: { flex: 1, fontSize: 16, padding: 0 },
  notesInput: { minHeight: 100, paddingTop: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  categoryText: { fontSize: 14, fontWeight: '500' },
  saveButton: { fontSize: 16, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  timeColumn: { flex: 1 },
  timeLabel: { fontSize: 12, marginBottom: 4 },
  timeInput: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 16, marginLeft: 10 },
  timeSeparator: { fontSize: 16, paddingBottom: 14 },
  statusGrid: { flexDirection: 'row', gap: 8 },
  statusButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: '500' },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  calendarButtonText: { fontSize: 16, fontWeight: '500' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  deleteButtonText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  modalOverlayCenter: { justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 80 },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  modalContentCenter: { borderRadius: 20, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
  modalTitle: { fontSize: 16, fontWeight: '600' },
  modalButton: { fontSize: 16, fontWeight: '500' },
  pickerContainer: { alignItems: 'center' },
  manualToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'center', marginTop: 8 },
  manualToggleText: { fontSize: 14, fontWeight: '500', marginLeft: 6 },
  manualInput: { fontSize: 32, fontWeight: '600', textAlign: 'center', paddingVertical: 40, paddingHorizontal: 20, borderWidth: 1, borderRadius: 12, width: 180, letterSpacing: 4 },
});

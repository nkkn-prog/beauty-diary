import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, TextInput, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  date: string;
  initialMemo?: string;
  onSave: (memo: string) => Promise<void>;
  saving?: boolean;
};

export function DailyNoteInput({ date, initialMemo, onSave, saving }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [memo, setMemo] = useState(initialMemo ?? '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMemo(initialMemo ?? '');
    setIsEditing(false);
  }, [initialMemo, date]);

  const hasChanged = memo !== (initialMemo ?? '');
  const canSave = memo.trim().length > 0 && hasChanged;

  const handleSave = async () => {
    if (!canSave || saving) return;
    await onSave(memo.trim());
    setIsEditing(false);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={colors.accent}
            style={styles.icon}
          />
          <ThemedText style={styles.title}>今日の自分磨き</ThemedText>
        </View>
        {saving && <ActivityIndicator size="small" color={colors.accent} />}
      </View>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: isEditing ? colors.accent : colors.border,
          },
        ]}
        placeholder="今日やった自分磨きを記録しよう..."
        placeholderTextColor={colors.textSecondary}
        value={memo}
        onChangeText={setMemo}
        onFocus={() => setIsEditing(true)}
        multiline
        textAlignVertical="top"
      />

      {(isEditing || hasChanged) && (
        <View style={styles.actions}>
          {hasChanged && (
            <Pressable
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => {
                setMemo(initialMemo ?? '');
                setIsEditing(false);
              }}
            >
              <ThemedText style={[styles.cancelText, { color: colors.textSecondary }]}>
                キャンセル
              </ThemedText>
            </Pressable>
          )}
          <Pressable
            style={[
              styles.saveButton,
              {
                backgroundColor: canSave ? colors.accent : colors.border,
                opacity: canSave ? 1 : 0.5,
              },
            ]}
            onPress={handleSave}
            disabled={!canSave || saving}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <ThemedText style={styles.saveText}>保存</ThemedText>
          </Pressable>
        </View>
      )}

      {!isEditing && !hasChanged && initialMemo && (
        <View style={styles.savedIndicator}>
          <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
          <ThemedText style={[styles.savedText, { color: colors.textSecondary }]}>
            保存済み
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    minHeight: 80,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  savedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  savedText: {
    fontSize: 12,
  },
});

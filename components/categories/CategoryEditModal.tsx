import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Category, COLOR_PALETTE } from '@/types/treatment';

type CategoryEditModalProps = {
  visible: boolean;
  category: Category | null;
  onSave: (label: string, color: string) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
};

export function CategoryEditModal({
  visible,
  category,
  onSave,
  onClose,
  saving,
}: CategoryEditModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [label, setLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_PALETTE[0]);

  useEffect(() => {
    if (category) {
      setLabel(category.label);
      setSelectedColor(category.color);
    } else {
      setLabel('');
      setSelectedColor(COLOR_PALETTE[0]);
    }
  }, [category, visible]);

  const handleSave = async () => {
    if (label.trim() && !saving) {
      await onSave(label.trim(), selectedColor);
      onClose();
    }
  };

  const isEditing = category !== null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable
            style={[
              styles.content,
              { backgroundColor: colors.surface, marginTop: insets.top + 60 },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Pressable onPress={onClose} hitSlop={8}>
                <ThemedText style={[styles.headerButton, { color: colors.textSecondary }]}>
                  キャンセル
                </ThemedText>
              </Pressable>
              <ThemedText style={styles.title}>
                {isEditing ? 'カテゴリを編集' : 'カテゴリを追加'}
              </ThemedText>
              <Pressable
                onPress={handleSave}
                disabled={!label.trim() || saving}
                hitSlop={8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <ThemedText
                    style={[
                      styles.headerButton,
                      { color: label.trim() ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    保存
                  </ThemedText>
                )}
              </Pressable>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  カテゴリ名
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={label}
                  onChangeText={setLabel}
                  placeholder="例: フェイシャル、ボディケア"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={20}
                  autoFocus
                />
              </View>

              <View style={styles.section}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  カラー
                </ThemedText>
                <View style={styles.colorGrid}>
                  {COLOR_PALETTE.map((color) => (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorButtonSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <View style={styles.checkmark}>
                          <ThemedText style={styles.checkmarkText}>
                            ✓
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.preview}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  プレビュー
                </ThemedText>
                <View
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: `${selectedColor}30`,
                      borderColor: selectedColor,
                    },
                  ]}
                >
                  <View style={[styles.previewDot, { backgroundColor: selectedColor }]} />
                  <ThemedText style={[styles.previewText, { color: selectedColor }]}>
                    {label || 'カテゴリ名'}
                  </ThemedText>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
  },
  content: {
    borderRadius: 20,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  body: {
    padding: 20,
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  preview: {
    marginBottom: 40,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

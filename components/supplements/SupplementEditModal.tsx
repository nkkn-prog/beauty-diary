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
import { Supplement, EMOJI_PALETTE } from '@/types/treatment';

type SupplementEditModalProps = {
  visible: boolean;
  supplement: Supplement | null;
  onSave: (name: string, emoji: string, url?: string) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
};

export function SupplementEditModal({
  visible,
  supplement,
  onSave,
  onClose,
  saving,
}: SupplementEditModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(EMOJI_PALETTE[0]);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (supplement) {
      setName(supplement.name);
      setSelectedEmoji(supplement.emoji);
      setUrl(supplement.url || '');
    } else {
      setName('');
      setSelectedEmoji(EMOJI_PALETTE[0]);
      setUrl('');
    }
  }, [supplement, visible]);

  const handleSave = async () => {
    if (name.trim() && !saving) {
      await onSave(name.trim(), selectedEmoji, url.trim() || undefined);
      onClose();
    }
  };

  const isEditing = supplement !== null;

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
                {isEditing ? 'サプリメントを編集' : 'サプリメントを追加'}
              </ThemedText>
              <Pressable
                onPress={handleSave}
                disabled={!name.trim() || saving}
                hitSlop={8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <ThemedText
                    style={[
                      styles.headerButton,
                      { color: name.trim() ? colors.accent : colors.textSecondary },
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
                  サプリメント名
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
                  value={name}
                  onChangeText={setName}
                  placeholder="例: ビタミンC、鉄分"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={20}
                  autoFocus
                />
              </View>

              <View style={styles.section}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  購入URL（任意）
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
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://..."
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.section}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  アイコン
                </ThemedText>
                <View style={styles.emojiGrid}>
                  {EMOJI_PALETTE.map((emoji) => (
                    <Pressable
                      key={emoji}
                      style={[
                        styles.emojiButton,
                        { backgroundColor: colors.background },
                        selectedEmoji === emoji && [
                          styles.emojiButtonSelected,
                          { borderColor: colors.accent },
                        ],
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <ThemedText style={styles.emojiText}>{emoji}</ThemedText>
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
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ThemedText style={styles.previewEmoji}>{selectedEmoji}</ThemedText>
                  <ThemedText style={styles.previewText}>
                    {name || 'サプリメント名'}
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
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 24,
  },
  preview: {
    marginBottom: 40,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  previewEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

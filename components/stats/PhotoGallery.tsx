import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BeforeAfterPhoto } from '@/types/photo';

type Props = {
  beforePhotos: BeforeAfterPhoto[];
  afterPhotos: BeforeAfterPhoto[];
  onAddPhoto?: (type: 'before' | 'after') => void;
  onPhotoPress?: (photo: BeforeAfterPhoto) => void;
  isApiAvailable: boolean;
};

export function PhotoGallery({
  beforePhotos,
  afterPhotos,
  onAddPhoto,
  onPhotoPress,
  isApiAvailable,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!isApiAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.unavailable}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="images-outline" size={32} color={colors.accent} />
          </View>
          <ThemedText style={[styles.unavailableText, { color: colors.textSecondary }]}>
            Before/After機能は準備中です
          </ThemedText>
        </View>
      </View>
    );
  }

  const hasPhotos = beforePhotos.length > 0 || afterPhotos.length > 0;

  if (!hasPhotos) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.empty}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="camera-outline" size={32} color={colors.accent} />
          </View>
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            写真を追加して変化を記録しよう
          </ThemedText>
          <View style={styles.addButtons}>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.accentLight }]}
              onPress={() => onAddPhoto?.('before')}
            >
              <Ionicons name="add" size={20} color={colors.accent} />
              <ThemedText style={[styles.addButtonText, { color: colors.accent }]}>
                Before
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.accentLight }]}
              onPress={() => onAddPhoto?.('after')}
            >
              <Ionicons name="add" size={20} color={colors.accent} />
              <ThemedText style={[styles.addButtonText, { color: colors.accent }]}>
                After
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Before</ThemedText>
          <Pressable
            style={styles.addSmall}
            onPress={() => onAddPhoto?.('before')}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
          </Pressable>
        </View>
        <View style={styles.photoGrid}>
          {beforePhotos.slice(0, 3).map((photo) => (
            <Pressable
              key={photo.id}
              style={styles.photoItem}
              onPress={() => onPhotoPress?.(photo)}
            >
              <Image source={{ uri: photo.uri }} style={styles.photo} />
            </Pressable>
          ))}
          {beforePhotos.length === 0 && (
            <View style={[styles.placeholder, { borderColor: colors.border }]}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>After</ThemedText>
          <Pressable
            style={styles.addSmall}
            onPress={() => onAddPhoto?.('after')}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
          </Pressable>
        </View>
        <View style={styles.photoGrid}>
          {afterPhotos.slice(0, 3).map((photo) => (
            <Pressable
              key={photo.id}
              style={styles.photoItem}
              onPress={() => onPhotoPress?.(photo)}
            >
              <Image source={{ uri: photo.uri }} style={styles.photo} />
            </Pressable>
          ))}
          {afterPhotos.length === 0 && (
            <View style={[styles.placeholder, { borderColor: colors.border }]}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  unavailable: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  unavailableText: {
    fontSize: 14,
    marginTop: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  addButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  addSmall: {
    padding: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
});

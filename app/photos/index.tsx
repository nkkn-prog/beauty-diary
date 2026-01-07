import { useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PhotoGallery, PhotoCompareView } from '@/components/stats';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePhotos } from '@/hooks/use-photos';
import { PhotoType } from '@/types/photo';

export default function PhotosScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const {
    apiAvailable,
    getPhotosByType,
    pickAndAddPhoto,
  } = usePhotos();

  const handleAddPhoto = useCallback(
    async (type: PhotoType) => {
      try {
        await pickAndAddPhoto(type);
      } catch (error) {
        Alert.alert(
          'エラー',
          error instanceof Error ? error.message : '写真の追加に失敗しました'
        );
      }
    },
    [pickAndAddPhoto]
  );

  const beforePhotos = getPhotosByType('before');
  const afterPhotos = getPhotosByType('after');

  // 最新のBefore/After写真を比較用に取得
  const latestBefore = beforePhotos[0];
  const latestAfter = afterPhotos[0];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Before / After',
          headerBackTitle: '戻る',
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {!apiAvailable ? (
            <View style={styles.unavailableContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="images-outline" size={48} color={colors.accent} />
              </View>
              <ThemedText style={[styles.unavailableTitle, { color: colors.text }]}>
                準備中
              </ThemedText>
              <ThemedText style={[styles.unavailableText, { color: colors.textSecondary }]}>
                Before/After写真機能は{'\n'}現在準備中です
              </ThemedText>
            </View>
          ) : (
            <>
              {(latestBefore || latestAfter) && (
                <PhotoCompareView
                  beforePhoto={latestBefore}
                  afterPhoto={latestAfter}
                />
              )}

              <PhotoGallery
                beforePhotos={beforePhotos}
                afterPhotos={afterPhotos}
                onAddPhoto={handleAddPhoto}
                isApiAvailable={apiAvailable}
              />
            </>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  unavailableContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  unavailableTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  unavailableText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});

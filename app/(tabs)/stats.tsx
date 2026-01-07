import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionHeader } from '@/components/home/SectionHeader';
import {
  PeriodSelector,
  OverviewCards,
  MonthlyChart,
  CategoryChart,
  EmptyStats,
  PhotoGallery,
} from '@/components/stats';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStats } from '@/hooks/use-stats';
import { usePhotos } from '@/hooks/use-photos';
import { StatsPeriod } from '@/types/stats';
import { PhotoType } from '@/types/photo';

export default function StatsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [period, setPeriod] = useState<StatsPeriod>('all');
  const { loading: statsLoading, overview, monthlyStats, categoryStats } = useStats(period);
  const {
    loading: photosLoading,
    apiAvailable,
    getPhotosByType,
    pickAndAddPhoto,
    refresh: refreshPhotos,
  } = usePhotos();

  useFocusEffect(
    useCallback(() => {
      refreshPhotos();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

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

  const loading = statsLoading || photosLoading;
  const hasData = overview.totalTreatments > 0;
  const beforePhotos = getPhotosByType('before');
  const afterPhotos = getPhotosByType('after');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ height: 20 }} />
      <View style={styles.header}>
        <ThemedText style={styles.title}>記録</ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PeriodSelector selected={period} onChange={setPeriod} />

          {hasData ? (
            <>
              <OverviewCards stats={overview} />

              {monthlyStats.length > 0 && (
                <MonthlyChart data={monthlyStats} />
              )}

              {categoryStats.length > 0 && (
                <CategoryChart data={categoryStats} />
              )}
            </>
          ) : (
            <EmptyStats />
          )}

          <View style={styles.photoSection}>
            <SectionHeader
              icon="images-outline"
              title="Before / After"
            />
            <PhotoGallery
              beforePhotos={[]}
              afterPhotos={[]}
              onAddPhoto={handleAddPhoto}
              isApiAvailable={false}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  photoSection: {
    marginTop: 8,
  },
});

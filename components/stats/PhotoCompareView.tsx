import { Image, StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BeforeAfterPhoto } from '@/types/photo';

type Props = {
  beforePhoto?: BeforeAfterPhoto;
  afterPhoto?: BeforeAfterPhoto;
};

const { width: screenWidth } = Dimensions.get('window');
const photoSize = (screenWidth - 60) / 2;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function PhotoCompareView({ beforePhoto, afterPhoto }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!beforePhoto && !afterPhoto) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ThemedText style={styles.title}>比較</ThemedText>
      <View style={styles.compareContainer}>
        <View style={styles.photoSection}>
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Before</ThemedText>
          {beforePhoto ? (
            <>
              <Image
                source={{ uri: beforePhoto.uri }}
                style={[styles.photo, { borderColor: colors.border }]}
              />
              <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                {formatDate(beforePhoto.date)}
              </ThemedText>
            </>
          ) : (
            <View style={[styles.placeholder, { borderColor: colors.border }]}>
              <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={24} color={colors.accent} />
        </View>

        <View style={styles.photoSection}>
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>After</ThemedText>
          {afterPhoto ? (
            <>
              <Image
                source={{ uri: afterPhoto.uri }}
                style={[styles.photo, { borderColor: colors.border }]}
              />
              <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                {formatDate(afterPhoto.date)}
              </ThemedText>
            </>
          ) : (
            <View style={[styles.placeholder, { borderColor: colors.border }]}>
              <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  compareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSection: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: 8,
    borderWidth: 1,
  },
  placeholder: {
    width: photoSize,
    height: photoSize,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontSize: 11,
    marginTop: 6,
  },
  arrowContainer: {
    marginHorizontal: 12,
    marginTop: 20,
  },
});

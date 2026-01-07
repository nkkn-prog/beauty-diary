import { useAuth } from '@clerk/clerk-expo';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { BeforeAfterPhoto, CreatePhotoInput, PhotoType } from '@/types/photo';
import {
  fetchPhotos,
  createPhoto,
  deletePhoto as apiDeletePhoto,
} from '@/utils/api/photos';

type UsePhotosResult = {
  photos: BeforeAfterPhoto[];
  loading: boolean;
  error: Error | null;
  apiAvailable: boolean;
  refresh: () => Promise<void>;
  pickAndAddPhoto: (type: PhotoType) => Promise<BeforeAfterPhoto | null>;
  remove: (id: string) => Promise<boolean>;
  getPhotosByType: (type: PhotoType) => BeforeAfterPhoto[];
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
};

export function usePhotos(): UsePhotosResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const hasLoaded = useRef(false);

  const checkPermission = useCallback(async () => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await fetchPhotos(token);
      setPhotos(data);
      setApiAvailable(true);
      hasLoaded.current = true;
    } catch (err) {
      // API未実装の場合
      setApiAvailable(false);
      setPhotos([]);
      hasLoaded.current = true;
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    if (hasLoaded.current) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const data = await fetchPhotos(token);
        setPhotos(data);
        setApiAvailable(true);
        hasLoaded.current = true;
      } catch {
        setApiAvailable(false);
        setPhotos([]);
        hasLoaded.current = true;
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const pickAndAddPhoto = useCallback(
    async (type: PhotoType): Promise<BeforeAfterPhoto | null> => {
      if (!apiAvailable) {
        setError(new Error('写真機能は準備中です'));
        return null;
      }

      try {
        // expo-image-pickerで写真を選択
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });

        if (result.canceled || result.assets.length === 0) {
          return null;
        }

        const asset = result.assets[0];
        const today = new Date().toISOString().split('T')[0];

        const input: CreatePhotoInput = {
          type,
          assetId: asset.assetId || asset.uri,
          uri: asset.uri,
          date: today,
        };

        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const newPhoto = await createPhoto(token, input);
        setPhotos((prev) => [...prev, newPhoto]);
        return newPhoto;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('写真の追加に失敗しました')
        );
        throw err;
      }
    },
    [getToken, apiAvailable]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!apiAvailable) {
        setError(new Error('写真機能は準備中です'));
        return false;
      }

      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        await apiDeletePhoto(token, id);
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('写真の削除に失敗しました')
        );
        throw err;
      }
    },
    [getToken, apiAvailable]
  );

  const getPhotosByType = useCallback(
    (type: PhotoType): BeforeAfterPhoto[] => {
      return photos
        .filter((p) => p.type === type)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    [photos]
  );

  return {
    photos,
    loading,
    error,
    apiAvailable,
    refresh,
    pickAndAddPhoto,
    remove,
    getPhotosByType,
    requestPermission,
    hasPermission,
  };
}

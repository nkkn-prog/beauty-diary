export type PhotoType = 'before' | 'after';

export type BeforeAfterPhoto = {
  id: string;
  type: PhotoType;
  assetId: string;       // expo-media-libraryのasset ID
  uri: string;           // カメラロールのURI
  date: string;          // 'YYYY-MM-DD'
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePhotoInput = {
  type: PhotoType;
  assetId: string;
  uri: string;
  date: string;
  memo?: string;
};

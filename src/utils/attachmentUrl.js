export const ensureFirebaseStorageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('firebasestorage.googleapis.com') && !url.includes('alt=media')) {
    return url + (url.includes('?') ? '&' : '?') + 'alt=media';
  }
  return url;
};

export const isPdfUrl = (url) => /\.pdf(\?|$)/i.test(String(url ?? ''));

export const isPdfFile = (file) =>
  file?.type === 'application/pdf' || /\.pdf$/i.test(file?.name ?? '');

export const isImageFile = (file) => String(file?.type ?? '').startsWith('image/');

export const isImageUrl = (url) => {
  const value = String(url ?? '');
  if (value.startsWith('data:image/')) return true;
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(value);
};

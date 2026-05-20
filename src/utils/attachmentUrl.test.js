import { describe, it, expect } from 'vitest';
import {
  ensureFirebaseStorageUrl,
  isImageFile,
  isImageUrl,
  isPdfFile,
  isPdfUrl,
} from './attachmentUrl';

describe('attachmentUrl utils', () => {
  it('appends alt=media to firebase storage urls', () => {
    const url = 'https://firebasestorage.googleapis.com/v0/b/x/o/y';
    expect(ensureFirebaseStorageUrl(url)).toContain('alt=media');
  });

  it('detects image files and urls', () => {
    expect(isImageFile({ type: 'image/png', name: 'a.png' })).toBe(true);
    expect(isPdfFile({ type: 'application/pdf', name: 'a.pdf' })).toBe(true);
    expect(isImageUrl('https://example.com/receipt.jpg')).toBe(true);
    expect(isPdfUrl('https://example.com/receipt.pdf')).toBe(true);
  });
});

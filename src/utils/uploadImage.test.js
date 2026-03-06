import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImage } from './uploadImage';

const { mockRef, auth } = vi.hoisted(() => {
  const a = { currentUser: null };
  return { mockRef: vi.fn((_storage, path) => ({ _path: path })), auth: a };
});

vi.mock('../services/firebase', () => ({
  auth,
  storage: {},
}));

vi.mock('firebase/storage', () => ({
  ref: (...args) => mockRef(...args),
  uploadBytes: vi.fn(() => Promise.resolve()),
  getDownloadURL: vi.fn(() => Promise.resolve('https://storage.example.com/file.pdf')),
}));

vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn(() => Promise.resolve()),
}));

import { uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

describe('uploadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.currentUser = null;
    getDownloadURL.mockResolvedValue('https://storage.example.com/file.pdf');
  });

  it('returns error when no file provided', async () => {
    const result = await uploadImage(null);
    expect(result).toEqual({ url: null, error: 'No file provided' });
    expect(uploadBytes).not.toHaveBeenCalled();
  });

  it('returns error for invalid file type', async () => {
    const file = new File(['x'], 'doc.txt', { type: 'text/plain' });
    const result = await uploadImage(file);
    expect(result).toEqual({
      url: null,
      error: 'Formato inválido. Solo JPG, PNG, WEBP o PDF.',
    });
    expect(uploadBytes).not.toHaveBeenCalled();
  });

  it('accepts valid types: jpeg, png, webp, pdf', async () => {
    const types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    for (const type of types) {
      vi.clearAllMocks();
      const ext = type.includes('pdf') ? 'pdf' : 'jpg';
      const file = new File(['x'], `test.${ext}`, { type });
      const result = await uploadImage(file);
      expect(result.error).toBeNull();
      expect(result.url).toBe('https://storage.example.com/file.pdf');
    }
  });

  it('returns error when file exceeds 5MB', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });
    const result = await uploadImage(largeFile);
    expect(result).toEqual({
      url: null,
      error: 'Archivo muy grande. Máximo 5MB.',
    });
    expect(uploadBytes).not.toHaveBeenCalled();
  });

  it('calls signInAnonymously when auth.currentUser is null', async () => {
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
    await uploadImage(file);
    expect(signInAnonymously).toHaveBeenCalledWith(auth);
  });

  it('skips signInAnonymously when auth.currentUser exists', async () => {
    auth.currentUser = { uid: 'user-123' };
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
    await uploadImage(file);
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('uploads to custom folder', async () => {
    const file = new File(['x'], 'receipt.pdf', { type: 'application/pdf' });
    await uploadImage(file, 'withdrawals');
    expect(uploadBytes).toHaveBeenCalled();
    expect(mockRef).toHaveBeenCalled();
    const pathArg = mockRef.mock.calls[0][1];
    expect(pathArg).toMatch(/^withdrawals\/\d+_[a-z0-9]+\.pdf$/);
  });

  it('returns url on success', async () => {
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadImage(file);
    expect(result).toEqual({
      url: 'https://storage.example.com/file.pdf',
      error: null,
    });
  });

  it('returns error when uploadBytes throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    uploadBytes.mockRejectedValueOnce(new Error('Storage quota exceeded'));
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadImage(file);
    expect(result.url).toBeNull();
    expect(result.error).toBe('Storage quota exceeded');
    consoleSpy.mockRestore();
  });

  it('returns generic error message when error has no message', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    uploadBytes.mockRejectedValueOnce({});
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadImage(file);
    expect(result.error).toBe('Error al subir imagen');
    consoleSpy.mockRestore();
  });
});

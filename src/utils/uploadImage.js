import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { storage, auth } from '../services/firebase';

/**
 * Sube una imagen a Firebase Storage y retorna la URL pública
 * @param {File} file - Archivo de imagen a subir
 * @param {string} folder - Carpeta en Firebase Storage (ej: 'deposits')
 * @returns {Promise<{url: string | null, error: string | null}>}
 */
export const uploadImage = async (file, folder = 'deposits') => {
  try {
    if (!file) {
      return { url: null, error: 'No file provided' };
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return { url: null, error: 'Formato inválido. Solo JPG, PNG, WEBP o PDF.' };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { url: null, error: 'Archivo muy grande. Máximo 5MB.' };
    }

    // Inversores con login por email no tienen sesión Firebase Auth.
    // La sesión anónima satisface request.auth != null en Storage rules.
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomString}.${extension}`;

    // Subir archivo
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    // Obtener URL pública
    const downloadURL = await getDownloadURL(storageRef);

    return { url: downloadURL, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error: error.message || 'Error al subir imagen' };
  }
};

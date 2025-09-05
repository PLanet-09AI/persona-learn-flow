import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../config/firebase';

const storage = getStorage(app);

export const fileStorageService = {
  // Upload a file to Firebase Storage
  async uploadFile(path: string, file: File): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  // Upload user profile image
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    return this.uploadFile(`users/${userId}/profile/${file.name}`, file);
  },
  
  // Upload content related files (images, documents, etc.)
  async uploadContentFile(contentId: string, file: File): Promise<string> {
    return this.uploadFile(`content/${contentId}/${file.name}`, file);
  },
  
  // Delete a file from Firebase Storage
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
  
  // Get a download URL for a file
  async getFileUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  }
};

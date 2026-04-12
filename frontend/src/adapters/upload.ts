import { api } from './client';

export const uploadAdapter = {
  async uploadImage(file: File): Promise<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return api.postFormData('/upload', formData);
  }
};

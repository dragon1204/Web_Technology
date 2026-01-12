import api from './api';

const storageService = {
  // Upload single file
  uploadFile: async (file, folder = 'uploads', fileName = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (fileName) formData.append('fileName', fileName);

    const response = await api.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { folder },
    });
    // Backend có thể trả về { HttpCode, success, data: { fileName: ... } } hoặc trực tiếp là { fileName: ... }
    const data = response.data?.data || response.data;
    return data;
  },

  // Upload multiple files
  uploadMultipleFiles: async (files, folder = 'uploads') => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (folder) formData.append('folder', folder);

    const response = await api.post('/storage/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { folder },
    });
    return response.data;
  },

  // Get presigned URL for displaying images
  getFileUrl: async (fileName, expiry = 604800) => {
    const response = await api.get(`/storage/url/${encodeURIComponent(fileName)}`, {
      params: { expiry },
    });
    // Backend có thể trả về { HttpCode, success, data: { url: ... } } hoặc trực tiếp là { url: ... }
    return response.data?.data || response.data;
  },

  // Download file
  downloadFile: async (fileName) => {
    const response = await api.get(`/storage/download/${encodeURIComponent(fileName)}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get file info
  getFileInfo: async (fileName) => {
    const response = await api.get(`/storage/info/${encodeURIComponent(fileName)}`);
    return response.data;
  },

  // List files
  listFiles: async (folder = null, recursive = true) => {
    const params = {};
    if (folder) params.folder = folder;
    if (recursive !== undefined) params.recursive = recursive;
    
    const response = await api.get('/storage/list', { params });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileName) => {
    const response = await api.delete(`/storage/delete/${encodeURIComponent(fileName)}`);
    return response.data;
  },

  // Delete multiple files
  deleteMultipleFiles: async (fileNames) => {
    const params = new URLSearchParams();
    fileNames.forEach(name => params.append('fileNames', name));
    
    const response = await api.delete('/storage/delete/multiple', { params });
    return response.data;
  },

  // Check if file exists
  fileExists: async (fileName) => {
    const response = await api.get(`/storage/exists/${encodeURIComponent(fileName)}`);
    // Backend có thể trả về { HttpCode, success, data: { exists: true/false } } hoặc trực tiếp là { exists: true/false }
    return response.data?.data || response.data;
  },

  // Helper: Upload avatar
  uploadAvatar: async (file, userId) => {
    return storageService.uploadFile(file, 'avatars', `user-${userId}.jpg`);
  },

  // Helper: Upload vegetable image
  uploadVegetableImage: async (file, vegetableId = null) => {
    const fileName = vegetableId ? `vegetable-${vegetableId}.jpg` : null;
    return storageService.uploadFile(file, 'vegetables', fileName);
  },

  // Helper: Upload product images
  uploadProductImages: async (files) => {
    return storageService.uploadMultipleFiles(files, 'products');
  },

  // Helper: Get image URL for display
  getImageUrl: async (fileName) => {
    if (!fileName) return null;
    try {
      const result = await storageService.getFileUrl(fileName);
      // result có thể là { url: ... } hoặc trực tiếp là string URL
      return result?.url || result || null;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  },
};

export default storageService;

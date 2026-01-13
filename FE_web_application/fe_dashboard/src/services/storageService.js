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
    
    // Extract data từ response (xử lý nhiều format)
    const extractData = (response) => {
      if (response && response.data && response.data.data !== undefined) {
        return response.data.data;
      }
      if (response && response.data !== undefined) {
        return response.data;
      }
      return response;
    };
    
    const data = extractData(response);
    console.log('📤 Upload response data:', data);
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
    try {
      console.log('📡 Requesting file URL for:', fileName);
      const response = await api.get(`/storage/url/${encodeURIComponent(fileName)}`, {
        params: { expiry },
      });
      console.log('📦 Raw response.data:', response.data);
      
      // Backend trả về structure: 
      // { HttpCode: 200, success: true, data: { url: '...', fileName: '...', ... }, message: '...', timestamp: '...' }
      let url = null;
      
      if (response && response.data) {
        const responseData = response.data;
        console.log('🔍 Checking responseData structure:', {
          hasData: !!responseData.data,
          hasDataData: !!(responseData.data && responseData.data.data),
          hasDataDataData: !!(responseData.data && responseData.data.data && responseData.data.data.url),
          hasUrl: !!responseData.url,
          isString: typeof responseData === 'string'
        });
        
        // Case 1: { HttpCode: 200, data: { message: '...', data: { url: '...', ... } }, ... } - có 3 level data
        if (responseData.data && responseData.data.data && responseData.data.data.url) {
          url = responseData.data.data.url;
          console.log('✅ Found URL in response.data.data.data.url');
        }
        // Case 2: { data: { url: '...', fileName: '...' }, ... } - có 2 level data
        else if (responseData.data && typeof responseData.data === 'object' && responseData.data.url) {
          url = responseData.data.url;
          console.log('✅ Found URL in response.data.data.url');
        }
        // Case 3: { url: '...' } - direct url
        else if (responseData.url && typeof responseData.url === 'string') {
          url = responseData.url;
          console.log('✅ Found URL in response.data.url');
        }
        // Case 4: response.data is directly the URL string
        else if (typeof responseData === 'string') {
          url = responseData;
          console.log('✅ Found URL as direct string');
        }
        // Case 5: Check if data.data exists and is string
        else if (responseData.data && typeof responseData.data === 'string') {
          url = responseData.data;
          console.log('✅ Found URL in response.data.data (string)');
        }
      }
      
      console.log('🔗 Final extracted URL:', url);
      
      if (!url || typeof url !== 'string') {
        console.error('❌ Could not extract valid URL from response');
        console.error('Response structure:', JSON.stringify(response.data, null, 2));
        throw new Error('Invalid response format from server');
      }
      
      return url;
    } catch (error) {
      console.error('❌ Error in getFileUrl:', error);
      throw error;
    }
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
  // Không còn đặt tên file cố định theo userId; để backend/MinIO tự sinh tên
  uploadAvatar: async (file) => {
    return storageService.uploadFile(file, 'avatars');
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
      const url = await storageService.getFileUrl(fileName);
      // getFileUrl should return URL string directly now
      if (url && typeof url === 'string') {
        return url;
      }
      console.warn('⚠️ getFileUrl returned non-string:', url);
      return null;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  },
};

export default storageService;

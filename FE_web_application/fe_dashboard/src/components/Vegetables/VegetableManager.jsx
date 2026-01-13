import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import vegetableService from '../../services/vegetableService';
import storageService from '../../services/storageService';

const VegetableManager = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVegetable, setCurrentVegetable] = useState({
    name: '',
    category: 'leafy',
    description: '',
    image: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = [
    { value: 'leafy', label: 'Rau lá' },
    { value: 'root', label: 'Củ' },
    { value: 'fruit', label: 'Quả' },
    { value: 'herb', label: 'Rau thơm' },
  ];

  useEffect(() => {
    fetchVegetables();
  }, []);

  const fetchVegetables = async () => {
    try {
      setLoading(true);
      const data = await vegetableService.getAll();
      
      // Load images for vegetables
      const vegetablesWithImages = await Promise.all(
        data.map(async (veg) => {
          if (veg.image) {
            try {
              const url = await storageService.getImageUrl(veg.image);
              return { ...veg, imageUrl: url };
            } catch (err) {
              return veg;
            }
          }
          return veg;
        })
      );
      
      setVegetables(vegetablesWithImages);
    } catch (err) {
      setError('Không thể tải danh sách rau!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vegetable = null) => {
    if (vegetable) {
      setEditMode(true);
      setCurrentVegetable(vegetable);
      setImagePreview(vegetable.imageUrl || '');
    } else {
      setEditMode(false);
      setCurrentVegetable({
        name: '',
        category: 'leafy',
        description: '',
        image: null,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveVegetable = async () => {
    setError('');
    setSuccess('');

    if (!currentVegetable.name.trim()) {
      setError('Vui lòng nhập tên rau!');
      return;
    }

    try {
      setLoading(true);
      let imageFileName = currentVegetable.image;

      // Upload image if new file selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadResult = await storageService.uploadVegetableImage(
            imageFile,
            editMode ? currentVegetable.id : null
          );
          imageFileName = uploadResult.fileName;
        } catch (err) {
          setError('Không thể upload ảnh!');
          setUploadingImage(false);
          setLoading(false);
          return;
        }
        setUploadingImage(false);
      }

      const vegetableData = {
        name: currentVegetable.name,
        category: currentVegetable.category,
        description: currentVegetable.description || '',
        image: imageFileName,
      };

      if (editMode) {
        await vegetableService.update(currentVegetable.id, vegetableData);
        setSuccess('Cập nhật rau thành công!');
      } else {
        await vegetableService.create(vegetableData);
        setSuccess('Thêm rau mới thành công!');
      }

      await fetchVegetables();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu thông tin rau!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVegetable = async (vegetable) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${vegetable.name}"?`)) return;

    try {
      // Delete image if exists
      if (vegetable.image) {
        try {
          await storageService.deleteFile(vegetable.image);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }

      await vegetableService.delete(vegetable.id);
      setSuccess('Xóa rau thành công!');
      await fetchVegetables();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể xóa rau!');
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Quản Lý Rau
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Thêm, sửa, xóa và quản lý hình ảnh rau
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Rau Mới
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Vegetables Grid */}
      {loading && vegetables.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {vegetables.map((vegetable) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={vegetable.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {vegetable.imageUrl ? (
                    <img
                      src={vegetable.imageUrl}
                      alt={vegetable.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        console.error('Image load error:', vegetable.imageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                  )}
                  <Chip
                    label={getCategoryLabel(vegetable.category)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {vegetable.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {vegetable.description || 'Chưa có mô tả'}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(vegetable)}
                    fullWidth
                  >
                    Sửa
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteVegetable(vegetable)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Cập Nhật Rau' : 'Thêm Rau Mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Image Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Hình ảnh
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                  position: 'relative',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{ mt: 2 }}
                      disabled={uploadingImage}
                    >
                      Đổi ảnh
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </Button>
                  </>
                ) : (
                  <>
                    <ImageIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadIcon />}
                      disabled={uploadingImage}
                    >
                      Chọn ảnh
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </Button>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                    </Typography>
                  </>
                )}
                {uploadingImage && (
                  <CircularProgress
                    size={40}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-20px',
                      marginLeft: '-20px',
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Form Fields */}
            <TextField
              fullWidth
              label="Tên rau *"
              value={currentVegetable.name}
              onChange={(e) =>
                setCurrentVegetable({ ...currentVegetable, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              select
              label="Loại *"
              value={currentVegetable.category}
              onChange={(e) =>
                setCurrentVegetable({ ...currentVegetable, category: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={currentVegetable.description}
              onChange={(e) =>
                setCurrentVegetable({ ...currentVegetable, description: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveVegetable}
            variant="contained"
            disabled={loading || uploadingImage}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VegetableManager;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useWebSocket } from '../../hooks/useWebSocket';
import { gardenAPI } from '../../services/api';
import PairDeviceModal from './PairDeviceModal';
import toast from 'react-hot-toast';
import GardenDeviceMap from './GardenDeviceMap';
import MetricCardsSection from './MetricCardsSection';

/**
 * Component Dashboard của một garden cụ thể
 * Hiển thị thông tin nhiệt độ, độ ẩm, độ ẩm đất và điều khiển bơm
 */
function GardenDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pairDialogOpen, setPairDialogOpen] = useState(false);
  const [localPumpStatus, setLocalPumpStatus] = useState(null);

  const {
    connected,
    sensorData: wsSensorData,
    pumpStatus: wsPumpStatus,
    initialData,
    error: wsError,
    joinGarden,
    controlPump,
  } = useWebSocket({
    deviceMac: garden?.deviceMac || null,
    autoConnect: true,
    autoJoin: false, // Manual join
  });

  // Fetch garden data
  const fetchGarden = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gardenAPI.getById(id);
      const gardenData = response.data?.data || response.data;
      setGarden(gardenData);
    } catch (err) {
      console.error('Error fetching garden:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin garden');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGarden();
  }, [fetchGarden]);

  // Join WebSocket room when garden has deviceMac
  useEffect(() => {
    if (garden?.deviceMac && connected) {
      joinGarden(garden.deviceMac).catch((err) => {
        console.error('Failed to join garden:', err);
        toast.error('Không thể kết nối với thiết bị');
      });
    }
  }, [garden?.deviceMac, connected, joinGarden]);

  // Sync local status with WS status when it updates
  useEffect(() => {
    if (wsPumpStatus) {
      setLocalPumpStatus(null);
    }
  }, [wsPumpStatus]);

  // Update sensor data from WebSocket
  const sensorData = wsSensorData || initialData;
  const currentPumpStatus = localPumpStatus || wsPumpStatus?.status || wsPumpStatus || sensorData?.pumpStatus || 'AUTO';

  const handlePumpControl = async (action) => {
    if (!garden?.deviceMac) {
      toast.error('Garden chưa có thiết bị. Vui lòng thêm thiết bị trước.');
      return;
    }

    // Optimistic update
    setLocalPumpStatus(action);

    try {
      await controlPump(garden.deviceMac, action);
      toast.success(`Đã ${action === 'ON' ? 'bật' : action === 'OFF' ? 'tắt' : 'chuyển sang chế độ tự động'} bơm`);
    } catch (err) {
      console.error('Failed to control pump:', err);
      setLocalPumpStatus(null); // Revert on error
      toast.error(err.message || 'Không thể điều khiển bơm');
    }
  };

  const handlePairSuccess = async (gardenId, deviceMac) => {
    await fetchGarden(); // Refresh garden data
    toast.success(`Đã thêm thiết bị ${deviceMac} thành công!`);
    setPairDialogOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !garden) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/gardens')} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!garden) {
    return (
      <Box p={3}>
        <Alert severity="warning">Không tìm thấy garden</Alert>
        <Button onClick={() => navigate('/gardens')} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/gardens')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
              {garden.name}
            </Typography>

          </Box>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Chip
            label={connected ? 'Đã kết nối' : 'Đang kết nối...'}
            color={connected ? 'success' : 'default'}
            size="small"
          />
          {!garden.deviceMac && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SettingsIcon />}
              onClick={() => setPairDialogOpen(true)}
            >
              Thêm thiết bị
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {wsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {wsError}
        </Alert>
      )}

      {/* No Device Alert */}
      {!garden.deviceMac && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Garden này chưa có thiết bị được kết nối. Vui lòng thêm thiết bị để xem dữ liệu sensor và điều khiển bơm.
        </Alert>
      )}

      {/* Sensor Data and Controls */}
      {garden.deviceMac ? (
        <>
          {!connected && (
            <Box display="flex" alignItems="center" justifyContent="center" p={4}>
              <CircularProgress />
              <Typography ml={2}>Đang kết nối WebSocket...</Typography>
            </Box>
          )}

          {connected && !sensorData && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Đang chờ dữ liệu từ thiết bị...
            </Alert>
          )}

          {connected && sensorData && (
            <Grid container spacing={3}>
              {/* Metric Cards Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <MetricCardsSection
                    data={{
                      ...sensorData,
                      pumpControl: currentPumpStatus
                    }}
                  />
                </Box>
              </Grid>

              {/* Garden Device Map */}
              <Grid item xs={12}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: '0 !important' }}>
                    <GardenDeviceMap
                      pumpStatus={currentPumpStatus}
                      onPumpControl={handlePumpControl}
                      sensorData={sensorData}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Timestamp */}
              {sensorData.timestamp && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Cập nhật lúc: {new Date(sensorData.timestamp).toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Chưa có thiết bị
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Thêm thiết bị để bắt đầu theo dõi và điều khiển garden này
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SettingsIcon />}
            onClick={() => setPairDialogOpen(true)}
          >
            Thêm thiết bị
          </Button>
        </Paper>
      )}

      {/* Pair Device Modal */}
      <PairDeviceModal
        open={pairDialogOpen}
        onClose={() => setPairDialogOpen(false)}
        gardenId={garden.id}
        onPairSuccess={handlePairSuccess}
      />
    </Box>
  );
}

export default GardenDashboard;

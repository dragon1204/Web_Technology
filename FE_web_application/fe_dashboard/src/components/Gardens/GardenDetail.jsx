import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GrassIcon from '@mui/icons-material/Grass';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useWebSocket } from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';

/**
 * Component hiển thị chi tiết garden với dữ liệu sensor realtime và điều khiển bơm
 */
function GardenDetail({ garden, open, onClose }) {
  const [sensorData, setSensorData] = useState(null);
  const [pumpStatus, setPumpStatus] = useState(null);
  
  const {
    connected,
    sensorData: wsSensorData,
    pumpStatus: wsPumpStatus,
    initialData,
    error,
    joinGarden,
    controlPump,
  } = useWebSocket({
    deviceMac: garden?.deviceMac || null,
    autoConnect: true,
    autoJoin: false, // Manual join when dialog opens
  });

  // Join garden room when dialog opens
  useEffect(() => {
    if (open && garden?.deviceMac && connected) {
      joinGarden(garden.deviceMac).catch((err) => {
        console.error('Failed to join garden:', err);
        toast.error('Không thể kết nối với thiết bị');
      });
    }
  }, [open, garden?.deviceMac, connected, joinGarden]);

  // Update sensor data from WebSocket
  useEffect(() => {
    if (wsSensorData) {
      setSensorData(wsSensorData);
    } else if (initialData) {
      setSensorData(initialData);
    }
  }, [wsSensorData, initialData]);

  // Update pump status from WebSocket
  useEffect(() => {
    if (wsPumpStatus) {
      setPumpStatus(wsPumpStatus.status || wsPumpStatus);
    } else if (initialData?.pumpStatus) {
      setPumpStatus(initialData.pumpStatus);
    }
  }, [wsPumpStatus, initialData]);

  const handlePumpControl = async (action) => {
    if (!garden?.deviceMac) {
      toast.error('Garden chưa có thiết bị');
      return;
    }

    try {
      await controlPump(garden.deviceMac, action);
      setPumpStatus(action);
      toast.success(`Đã ${action === 'ON' ? 'bật' : action === 'OFF' ? 'tắt' : 'chuyển sang chế độ tự động'} bơm`);
    } catch (err) {
      console.error('Failed to control pump:', err);
      toast.error(err.message || 'Không thể điều khiển bơm');
    }
  };

  if (!garden) return null;

  const data = sensorData || initialData;
  const currentPumpStatus = pumpStatus || data?.pumpStatus || 'AUTO';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{garden.name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary">
            Garden ID: {garden.id}
          </Typography>
          {garden.deviceMac && (
            <Typography variant="body2" color="textSecondary">
              Device MAC: <strong>{garden.deviceMac}</strong>
            </Typography>
          )}
          <Box mt={1}>
            <Chip
              label={connected ? 'Đã kết nối' : 'Đang kết nối...'}
              color={connected ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </Box>

        {!garden.deviceMac ? (
          <Card>
            <CardContent>
              <Alert severity="warning">
                Garden này chưa có device được kết nối. Vui lòng pair device trước.
              </Alert>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !connected ? (
          <Box display="flex" alignItems="center" justifyContent="center" p={4}>
            <CircularProgress />
            <Typography ml={2}>Đang kết nối WebSocket...</Typography>
          </Box>
        ) : (
          <Box>
            {!data && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Đang chờ dữ liệu từ thiết bị...
              </Alert>
            )}

            {data && (
              <Grid container spacing={2}>
                {/* Nhiệt độ */}
                {(data.temperature !== null && data.temperature !== undefined) && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <ThermostatIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="h4" color="error">
                            {data.temperature?.toFixed(1) || 'N/A'}°C
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Nhiệt độ
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Độ ẩm */}
                {(data.humidity !== null && data.humidity !== undefined) && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <WaterDropIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="h4" color="primary">
                            {data.humidity?.toFixed(1) || 'N/A'}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Độ ẩm không khí
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Độ ẩm đất */}
                {((data.soilMoisture !== null && data.soilMoisture !== undefined) || 
                  (data.soil !== null && data.soil !== undefined)) && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <GrassIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="h4" color="success.main">
                            {(data.soilMoisture || data.soil)?.toFixed(1) || 'N/A'}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Độ ẩm đất
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Điều khiển bơm */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <PowerSettingsNewIcon
                            color={
                              currentPumpStatus === 'ON'
                                ? 'success'
                                : currentPumpStatus === 'OFF'
                                ? 'error'
                                : 'default'
                            }
                            sx={{ fontSize: 40 }}
                          />
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Trạng thái bơm
                            </Typography>
                            <Typography variant="h6">
                              <Chip
                                label={currentPumpStatus}
                                color={
                                  currentPumpStatus === 'ON'
                                    ? 'success'
                                    : currentPumpStatus === 'OFF'
                                    ? 'error'
                                    : 'default'
                                }
                                size="small"
                              />
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Button
                            variant={currentPumpStatus === 'ON' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => handlePumpControl('ON')}
                            disabled={!connected}
                            startIcon={<PowerSettingsNewIcon />}
                          >
                            BẬT
                          </Button>
                          <Button
                            variant={currentPumpStatus === 'OFF' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => handlePumpControl('OFF')}
                            disabled={!connected}
                            startIcon={<PowerSettingsNewIcon />}
                          >
                            TẮT
                          </Button>
                          <Button
                            variant={currentPumpStatus === 'AUTO' ? 'contained' : 'outlined'}
                            color="primary"
                            onClick={() => handlePumpControl('AUTO')}
                            disabled={!connected}
                            startIcon={<PowerSettingsNewIcon />}
                          >
                            TỰ ĐỘNG
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Timestamp */}
                {data.timestamp && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Cập nhật lúc: {new Date(data.timestamp).toLocaleString('vi-VN')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default GardenDetail;

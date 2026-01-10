import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, CircularProgress } from '@mui/material';
import { useWebSocket } from '../../hooks/useWebSocket';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GrassIcon from '@mui/icons-material/Grass';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

/**
 * Component hiển thị dữ liệu sensor realtime
 * 
 * @param {Object} props
 * @param {string} props.deviceMac - MAC address của device
 * @param {boolean} props.showControls - Hiển thị nút điều khiển bơm (default: false)
 */
function SensorDataDisplay({ deviceMac, showControls = false }) {
  const {
    connected,
    sensorData,
    pumpStatus,
    initialData,
    error,
    controlPump,
  } = useWebSocket({
    deviceMac,
    autoConnect: true,
    autoJoin: true,
  });

  // Sử dụng dữ liệu realtime hoặc initial data
  const data = sensorData || initialData;

  const handlePumpControl = async (action) => {
    try {
      await controlPump(deviceMac, action);
    } catch (err) {
      console.error('Failed to control pump:', err);
    }
  };

  if (!deviceMac) {
    return (
      <Card>
        <CardContent>
          <Typography color="textSecondary">Vui lòng chọn device để xem dữ liệu sensor</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Lỗi: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!connected) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Đang kết nối WebSocket...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Dữ Liệu Sensor Realtime</Typography>
          <Chip
            label={connected ? 'Đã kết nối' : 'Đang kết nối'}
            color={connected ? 'success' : 'default'}
            size="small"
          />
        </Box>

        {!data && (
          <Typography color="textSecondary">Đang chờ dữ liệu...</Typography>
        )}

        {data && (
          <Grid container spacing={2}>
            {/* Nhiệt độ */}
            {data.temperature !== null && data.temperature !== undefined && (
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <ThermostatIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="error">
                    {data.temperature?.toFixed(1) || 'N/A'}°C
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Nhiệt độ
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Độ ẩm */}
            {data.humidity !== null && data.humidity !== undefined && (
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <WaterDropIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {data.humidity?.toFixed(1) || 'N/A'}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Độ ẩm
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Độ ẩm đất */}
            {data.soil !== null && data.soil !== undefined && (
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <GrassIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {data.soil?.toFixed(1) || 'N/A'}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Độ ẩm đất
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Trạng thái bơm */}
            {(data.pumpControl || pumpStatus) && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <PowerSettingsNewIcon
                      color={
                        (pumpStatus?.status || data.pumpControl) === 'ON'
                          ? 'success'
                          : (pumpStatus?.status || data.pumpControl) === 'OFF'
                          ? 'error'
                          : 'default'
                      }
                      sx={{ fontSize: 40 }}
                    />
                    <Box>
                      <Typography variant="h6">
                        Trạng thái bơm:{' '}
                        <Chip
                          label={pumpStatus?.status || data.pumpControl || 'AUTO'}
                          color={
                            (pumpStatus?.status || data.pumpControl) === 'ON'
                              ? 'success'
                              : (pumpStatus?.status || data.pumpControl) === 'OFF'
                              ? 'error'
                              : 'default'
                          }
                          size="small"
                        />
                      </Typography>
                    </Box>
                  </Box>

                  {showControls && (
                    <Box display="flex" gap={1}>
                      <Chip
                        label="ON"
                        onClick={() => handlePumpControl('ON')}
                        color={data.pumpControl === 'ON' ? 'success' : 'default'}
                        clickable
                      />
                      <Chip
                        label="OFF"
                        onClick={() => handlePumpControl('OFF')}
                        color={data.pumpControl === 'OFF' ? 'error' : 'default'}
                        clickable
                      />
                      <Chip
                        label="AUTO"
                        onClick={() => handlePumpControl('AUTO')}
                        color={data.pumpControl === 'AUTO' ? 'primary' : 'default'}
                        clickable
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {/* Timestamp */}
            {data.timestamp && (
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Cập nhật lúc:{' '}
                  {new Date(data.timestamp).toLocaleString('vi-VN')}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

export default SensorDataDisplay;

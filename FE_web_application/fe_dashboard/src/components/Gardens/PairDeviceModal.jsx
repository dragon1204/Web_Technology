import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useWebSocket } from '../../hooks/useWebSocket';
import websocketService from '../../services/websocket';
import toast from 'react-hot-toast';

/**
 * Modal để pair thiết bị với garden
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal mở hay đóng
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {number} props.gardenId - ID của garden cần pair
 * @param {Function} props.onPairSuccess - Callback khi pair thành công (gardenId, deviceMac)
 */
function PairDeviceModal({ open, onClose, gardenId, onPairSuccess }) {
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 phút = 240 giây
  const [isPairing, setIsPairing] = useState(false);
  const [pairingStatus, setPairingStatus] = useState(null); // 'pairing' | 'success' | 'timeout' | 'error'
  const [deviceMac, setDeviceMac] = useState(null);
  const timerRef = useRef(null);
  const { connected, startPairing, error } = useWebSocket({ autoConnect: true, autoJoin: false });

  // Bắt đầu đếm ngược khi mở modal
  useEffect(() => {
    if (open && isPairing) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [open, isPairing]);

  // Lắng nghe sự kiện pairing từ websocket
  useEffect(() => {
    if (!open) return;

    const handlePairSuccess = (data) => {
      console.log('Pair success received:', data);
      setPairingStatus('success');
      setDeviceMac(data.deviceMac);
      setIsPairing(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success(`Đã thêm thiết bị ${data.deviceMac} thành công!`);
    };

    const handlePairTimeout = (data) => {
      console.log('Pair timeout received:', data);
      setPairingStatus('timeout');
      setIsPairing(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.error(data.message || 'Hết thời gian chờ. Vui lòng thử lại');
    };

    websocketService.on('pairSuccess', handlePairSuccess);
    websocketService.on('pairTimeout', handlePairTimeout);

    return () => {
      websocketService.off('pairSuccess', handlePairSuccess);
      websocketService.off('pairTimeout', handlePairTimeout);
    };
  }, [open]);

  const handleStartPairing = async () => {
    if (!connected) {
      toast.error('WebSocket chưa kết nối. Vui lòng đợi...');
      return;
    }

    setIsPairing(true);
    setPairingStatus('pairing');
    setTimeRemaining(240);
    setDeviceMac(null);

    try {
      await startPairing(gardenId);
      toast.success('Đã bắt đầu tìm kiếm thiết bị. Vui lòng nhấn nút trên thiết bị ESP32.');
    } catch (err) {
      console.error('Failed to start pairing:', err);
      setPairingStatus('error');
      setIsPairing(false);
      toast.error(err.message || 'Không thể bắt đầu pairing');
    }
  };

  const handleTimeout = () => {
    setPairingStatus('timeout');
    setIsPairing(false);
    toast.error('Hết thời gian chờ. Vui lòng thử lại');
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPairing(false);
    setPairingStatus(null);
    setTimeRemaining(240);
    setDeviceMac(null);
    onClose();
  };

  const handleSave = () => {
    if (deviceMac && onPairSuccess) {
      onPairSuccess(gardenId, deviceMac);
    }
    handleClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (240 - timeRemaining) / 240 * 100;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Tìm kiếm thiết bị</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {!isPairing && pairingStatus === null && (
            <>
              <Typography variant="body1" gutterBottom>
                Bấm "Bắt đầu tìm kiếm" để bắt đầu quá trình ghép thiết bị với garden này.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  <strong>Hướng dẫn:</strong>
                  <br />
                  1. Nhấn nút "Bắt đầu tìm kiếm"
                  <br />
                  2. Nhấn nút trên thiết bị ESP32 để kích hoạt chế độ pairing
                  <br />
                  3. Đợi tối đa 4 phút để hệ thống tìm thấy thiết bị
                </Typography>
              </Alert>
            </>
          )}

          {isPairing && pairingStatus === 'pairing' && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  Đang tìm kiếm thiết bị...
                </Typography>
                <Typography variant="h4" align="center" color="primary" gutterBottom>
                  {formatTime(timeRemaining)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Vui lòng nhấn nút trên thiết bị ESP32 để kích hoạt chế độ pairing.
                  <br />
                  Thời gian còn lại: {formatTime(timeRemaining)}
                </Typography>
              </Alert>
            </>
          )}

          {pairingStatus === 'success' && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom sx={{ color: 'text.primary' }}>
                  <strong>Đã thêm thiết bị thành công!</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  Device MAC: <strong>{deviceMac}</strong>
                </Typography>
              </Alert>
              <Typography variant="body2" color="textSecondary">
                Nhấn "Lưu" để hoàn tất và điều hướng về Dashboard của garden.
              </Typography>
            </>
          )}

          {pairingStatus === 'timeout' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Hết thời gian chờ</strong>
              </Typography>
              <Typography variant="body2">
                Không tìm thấy thiết bị trong thời gian quy định. Vui lòng thử lại.
              </Typography>
            </Alert>
          )}

          {pairingStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Lỗi khi bắt đầu pairing</strong>
              </Typography>
              <Typography variant="body2">
                {error || 'Vui lòng thử lại sau'}
              </Typography>
            </Alert>
          )}

          {!connected && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                WebSocket chưa kết nối. Vui lòng đợi...
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {pairingStatus === 'success' ? (
          <>
            <Button onClick={handleClose}>Hủy</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Lưu
            </Button>
          </>
        ) : pairingStatus === 'timeout' || pairingStatus === 'error' ? (
          <>
            <Button onClick={handleClose}>Đóng</Button>
            <Button onClick={handleStartPairing} variant="contained" color="primary">
              Thử lại
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={handleStartPairing}
              variant="contained"
              color="primary"
              disabled={!connected || isPairing}
            >
              {isPairing ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Đang tìm kiếm...
                </>
              ) : (
                'Bắt đầu tìm kiếm'
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default PairDeviceModal;

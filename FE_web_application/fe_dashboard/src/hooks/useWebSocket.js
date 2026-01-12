import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService from '../services/websocket';

/**
 * Custom hook để sử dụng WebSocket dễ dàng trong React components
 * 
 * @param {Object} options - Các tùy chọn
 * @param {string} options.deviceMac - MAC address của device để join room
 * @param {boolean} options.autoConnect - Tự động kết nối khi mount (default: true)
 * @param {boolean} options.autoJoin - Tự động join garden room khi có deviceMac (default: true)
 * @returns {Object} { connected, sensorData, pumpStatus, joinGarden, controlPump, error }
 */
export function useWebSocket(options = {}) {
  const {
    deviceMac = null,
    autoConnect = true,
    autoJoin = true,
  } = options;

  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [pumpStatus, setPumpStatus] = useState(null);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState(null);

  const hasJoinedRef = useRef(false);

  // Kết nối WebSocket
  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      websocketService.connect(token);

      // Kiểm tra trạng thái kết nối hiện tại
      const status = websocketService.getConnectionStatus();
      if (status.connected) {
        setConnected(true);
      }

      // Lắng nghe sự kiện kết nối
      const onConnected = () => {
        setConnected(true);
        setError(null);
      };

      const onDisconnected = () => {
        setConnected(false);
        hasJoinedRef.current = false;
      };

      const onError = (err) => {
        setError(err.error || 'WebSocket connection error');
        setConnected(false);
      };

      // Lắng nghe dữ liệu sensor (theo spec: iot/sensor)
      const onSensorData = (data) => {
        console.log('useWebSocket: Received sensor data', data);
        setSensorData(data);
        setError(null);
      };

      // Lắng nghe cập nhật trạng thái bơm
      const onPumpStatus = (data) => {
        console.log('useWebSocket: Received pump status', data);
        setPumpStatus(data);
      };

      websocketService.on('connected', onConnected);
      websocketService.on('disconnected', onDisconnected);
      websocketService.on('error', onError);
      websocketService.on('sensorData', onSensorData);
      websocketService.on('pumpStatus', onPumpStatus);

      // Cleanup function
      return () => {
        websocketService.off('connected', onConnected);
        websocketService.off('disconnected', onDisconnected);
        websocketService.off('error', onError);
        websocketService.off('sensorData', onSensorData);
        websocketService.off('pumpStatus', onPumpStatus);
      };
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Join garden room
  const joinGarden = useCallback(async (mac) => {
    if (!websocketService.isConnected) {
      const errorMsg = 'WebSocket not connected';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const response = await websocketService.joinGarden(mac);
      console.log('useWebSocket: Joined garden, initial data:', response);
      if (response?.initialData) {
        setInitialData(response.initialData);
        // Set initial pump status if available
        if (response.initialData.pumpStatus) {
          setPumpStatus(response.initialData.pumpStatus);
        }
      }
      hasJoinedRef.current = true;
      setError(null);
      return response;
    } catch (err) {
      console.error('useWebSocket: Failed to join garden:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Điều khiển bơm
  const controlPump = useCallback(async (mac, action) => {
    if (!websocketService.isConnected) {
      setError('WebSocket not connected');
      return;
    }

    try {
      const response = await websocketService.controlPump(mac, action);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Bắt đầu pairing
  const startPairing = useCallback(async (gardenId) => {
    if (!websocketService.isConnected) {
      setError('WebSocket not connected');
      return;
    }

    try {
      const response = await websocketService.startPairing(gardenId);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Effect để tự động kết nối
  useEffect(() => {
    if (!autoConnect) return;

    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
      websocketService.disconnect();
    };
  }, [autoConnect, connect]);

  // Effect để tự động join garden khi có deviceMac
  useEffect(() => {
    if (!autoJoin || !deviceMac || !connected || hasJoinedRef.current) {
      return;
    }

    joinGarden(deviceMac).catch((err) => {
      console.error('Failed to join garden:', err);
    });

    return () => {
      if (hasJoinedRef.current) {
        websocketService.leaveGarden();
        hasJoinedRef.current = false;
      }
    };
  }, [autoJoin, deviceMac, connected, joinGarden]);

  return {
    connected,
    sensorData,
    pumpStatus,
    initialData,
    error,
    joinGarden,
    controlPump,
    startPairing,
    reconnect: connect,
  };
}

export default useWebSocket;

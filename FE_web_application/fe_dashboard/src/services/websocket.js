import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Kết nối tới WebSocket server
   * @param {string} token - JWT token để authenticate (optional)
   */
  connect(token = null) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    // Lấy token từ localStorage nếu không được truyền vào
    const authToken = token || localStorage.getItem('token');

    const options = {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    };

    // Thêm token vào auth hoặc query
    if (authToken) {
      options.auth = { token: authToken };
      options.query = { token: authToken };
    }

    this.socket = io(`${WS_URL}/devices`, options);

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.isConnected = true;
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.emit('error', { error: error.message });
    });

    // Lắng nghe dữ liệu sensor từ server (theo spec: iot/sensor)
    this.socket.on('iot/sensor', (data) => {
      console.log('📡 Received sensor data:', data);
      this.emit('sensorData', data);
    });

    // Lắng nghe cập nhật trạng thái bơm
    this.socket.on('pumpStatusUpdate', (data) => {
      console.log('💧 Pump status updated:', data);
      this.emit('pumpStatus', data);
    });

    // Event pairing từ server (giống fe-web)
    this.socket.on('iot/device/pair/success', (data) => {
      console.log('✅ Device paired successfully:', data);
      this.emit('pairSuccess', data);
    });

    this.socket.on('iot/device/pair/timeout', (data) => {
      console.log('⏰ Pairing timeout:', data);
      this.emit('pairTimeout', data);
    });
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Join vào room của một garden để nhận dữ liệu sensor
   * @param {string} deviceMac - MAC address của device
   * @returns {Promise} Promise với initial data từ server
   */
  joinGarden(deviceMac) {
    if (!this.socket?.connected) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('iot/garden/join', { deviceMac }, (response) => {
        if (response?.status === 'joined') {
          console.log(`✅ Joined garden room: ${deviceMac}`, response);
          resolve(response);
        } else {
          reject(new Error('Failed to join garden room'));
        }
      });
    });
  }

  /**
   * Rời khỏi room hiện tại
   */
  leaveGarden() {
    if (this.socket?.connected) {
      // Socket.io tự động leave room khi join room mới
      // Hoặc có thể implement logic leave riêng nếu cần
      console.log('Left garden room');
    }
  }

  /**
   * Bắt đầu chế độ pairing cho một garden
   * @param {number} gardenId - ID của garden
   */
  startPairing(gardenId) {
    if (!this.socket?.connected) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    return new Promise((resolve, reject) => {
      // Emit pairing request (theo spec: iot/device/pair)
      this.socket.emit('iot/device/pair', { gardenId: Number(gardenId) }, (response) => {
        if (response?.status === 'pairing_mode_active' || response?.success) {
          console.log(`⏳ Pairing mode started for garden ${gardenId}`);
          resolve(response);
        } else {
          reject(new Error(response?.message || 'Failed to start pairing mode'));
        }
      });
    });
  }

  /**
   * Điều khiển bơm
   * @param {string} deviceMac - MAC address của device
   * @param {string} action - 'ON' | 'OFF' | 'AUTO'
   */
  controlPump(deviceMac, action) {
    if (!this.socket?.connected) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('iot/device/pump', { mac: deviceMac, action }, (response) => {
        if (response?.status === 'success' || response?.success) {
          console.log(`💧 Pump control: ${action} for ${deviceMac}`);
          resolve(response);
        } else {
          reject(new Error(response?.message || 'Failed to control pump'));
        }
      });
    });
  }

  /**
   * Đăng ký listener cho một event
   * @param {string} event - Tên event
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Hủy đăng ký listener
   * @param {string} event - Tên event
   * @param {Function} callback - Callback function cần remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event tới các listeners
   * @param {string} event - Tên event
   * @param {any} data - Dữ liệu
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;

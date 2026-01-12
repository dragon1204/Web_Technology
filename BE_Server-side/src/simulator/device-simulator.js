// Device Simulator - Mô phỏng thiết bị IoT
const WebSocket = require('ws');
const mqtt = require('mqtt');

class DeviceSimulator {
  constructor() {
    this.devices = [
      {
        id: 'pump_001',
        name: 'Máy bơm nước 1',
        type: 'pump',
        status: 'off',
        location: 'Vườn A',
        controllable: true,
      },
      {
        id: 'light_001',
        name: 'Đèn LED 1',
        type: 'light',
        status: 'on',
        location: 'Vườn A',
        controllable: true,
      },
      {
        id: 'fan_001',
        name: 'Quạt thông gió',
        type: 'fan',
        status: 'off',
        location: 'Vườn B',
        controllable: true,
      },
      {
        id: 'temp_001',
        name: 'Cảm biến nhiệt độ',
        type: 'sensor',
        status: 'on',
        location: 'Vườn A',
        controllable: false,
        sensorType: 'temperature',
        unit: '°C',
        value: 25,
        min: 15,
        max: 40,
      },
      {
        id: 'humid_001',
        name: 'Cảm biến độ ẩm',
        type: 'sensor',
        status: 'on',
        location: 'Vườn B',
        controllable: false,
        sensorType: 'humidity',
        unit: '%',
        value: 65,
        min: 30,
        max: 90,
      },
      {
        id: 'soil_001',
        name: 'Cảm biến độ ẩm đất',
        type: 'sensor',
        status: 'on',
        location: 'Vườn A',
        controllable: false,
        sensorType: 'soil_moisture',
        unit: '%',
        value: 45,
        min: 20,
        max: 80,
      },
    ];

    this.wsServer = null;
    this.mqttClient = null;
    this.sensorInterval = null;
  }

  // Khởi tạo WebSocket server
  initWebSocket(port = 8080) {
    this.wsServer = new WebSocket.Server({ port });

    this.wsServer.on('connection', (ws) => {
      console.log('🔌 Device simulator connected via WebSocket');

      // Gửi trạng thái thiết bị hiện tại
      ws.send(
        JSON.stringify({
          type: 'device_list',
          data: this.devices,
        }),
      );

      // Lắng nghe lệnh điều khiển
      ws.on('message', (message) => {
        try {
          const command = JSON.parse(message);
          this.handleDeviceControl(command, ws);
        } catch (error) {
          console.error('❌ Invalid command:', error);
        }
      });

      ws.on('close', () => {
        console.log('🔌 Device simulator disconnected');
      });
    });

    console.log(`🚀 Device Simulator WebSocket running on port ${port}`);
  }

  // Khởi tạo MQTT client (tùy chọn)
  initMQTT(brokerUrl = 'mqtt://localhost:1883') {
    try {
      this.mqttClient = mqtt.connect(brokerUrl);

      this.mqttClient.on('connect', () => {
        console.log('📡 Connected to MQTT broker');

        // Subscribe to control topics
        this.devices.forEach((device) => {
          if (device.controllable) {
            this.mqttClient.subscribe(`garden/devices/${device.id}/control`);
          }
        });
      });

      this.mqttClient.on('message', (topic, message) => {
        const command = JSON.parse(message.toString());
        this.handleDeviceControl(command);
      });
    } catch (error) {
      console.log('⚠️ MQTT broker not available, using WebSocket only');
    }
  }

  // Xử lý lệnh điều khiển thiết bị
  handleDeviceControl(command, ws = null) {
    const { deviceId, action, value } = command;
    const device = this.devices.find((d) => d.id === deviceId);

    if (!device) {
      console.error(`❌ Device ${deviceId} not found`);
      return;
    }

    if (!device.controllable) {
      console.error(`❌ Device ${deviceId} is not controllable`);
      return;
    }

    // Cập nhật trạng thái thiết bị
    const oldStatus = device.status;

    switch (action) {
      case 'turn_on':
        device.status = 'on';
        break;
      case 'turn_off':
        device.status = 'off';
        break;
      case 'toggle':
        device.status = device.status === 'on' ? 'off' : 'on';
        break;
      case 'set_value':
        if (value !== undefined) {
          device.value = value;
        }
        break;
    }

    console.log(`🎛️ Device ${device.name}: ${oldStatus} → ${device.status}`);

    // Gửi cập nhật qua WebSocket
    if (this.wsServer) {
      const updateMessage = JSON.stringify({
        type: 'device_update',
        data: device,
      });

      this.wsServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(updateMessage);
        }
      });
    }

    // Gửi cập nhật qua MQTT
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish(
        `garden/devices/${device.id}/status`,
        JSON.stringify(device),
      );
    }

    // Mô phỏng phản hồi từ thiết bị thật
    this.simulateDeviceResponse(device);
  }

  // Mô phỏng phản hồi từ thiết bị
  simulateDeviceResponse(device) {
    setTimeout(
      () => {
        // Mô phỏng độ trễ và có thể thất bại
        const success = Math.random() > 0.1; // 90% thành công

        const response = {
          type: 'device_response',
          data: {
            deviceId: device.id,
            success,
            timestamp: new Date().toISOString(),
            message: success
              ? 'Command executed successfully'
              : 'Command failed',
          },
        };

        // Gửi phản hồi qua WebSocket
        if (this.wsServer) {
          this.wsServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(response));
            }
          });
        }
      },
      Math.random() * 1000 + 500,
    ); // Độ trễ 0.5-1.5s
  }

  // Mô phỏng dữ liệu cảm biến
  startSensorSimulation() {
    this.sensorInterval = setInterval(() => {
      this.devices.forEach((device) => {
        if (device.type === 'sensor' && device.status === 'on') {
          // Tạo dữ liệu ngẫu nhiên trong khoảng hợp lý
          const range = device.max - device.min;
          const variation = (Math.random() - 0.5) * 0.1 * range; // ±5% variation

          device.value = Math.max(
            device.min,
            Math.min(device.max, device.value + variation),
          );

          device.value = Math.round(device.value * 10) / 10; // 1 decimal place

          // Gửi dữ liệu cảm biến
          const sensorData = {
            type: 'sensor_data',
            data: {
              deviceId: device.id,
              sensorType: device.sensorType,
              value: device.value,
              unit: device.unit,
              timestamp: new Date().toISOString(),
              location: device.location,
            },
          };

          // Gửi qua WebSocket
          if (this.wsServer) {
            this.wsServer.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(sensorData));
              }
            });
          }

          // Gửi qua MQTT
          if (this.mqttClient && this.mqttClient.connected) {
            this.mqttClient.publish(
              `garden/sensors/${device.id}/data`,
              JSON.stringify(sensorData.data),
            );
          }
        }
      });
    }, 5000); // Gửi dữ liệu mỗi 5 giây
  }

  // Dừng mô phỏng
  stop() {
    if (this.sensorInterval) {
      clearInterval(this.sensorInterval);
    }

    if (this.wsServer) {
      this.wsServer.close();
    }

    if (this.mqttClient) {
      this.mqttClient.end();
    }

    console.log('🛑 Device simulator stopped');
  }

  // Lấy danh sách thiết bị
  getDevices() {
    return this.devices;
  }

  // Lấy thông tin một thiết bị
  getDevice(deviceId) {
    return this.devices.find((d) => d.id === deviceId);
  }
}

// Khởi chạy simulator
if (require.main === module) {
  const simulator = new DeviceSimulator();

  // Khởi tạo WebSocket
  simulator.initWebSocket(8080);

  // Khởi tạo MQTT (tùy chọn)
  simulator.initMQTT();

  // Bắt đầu mô phỏng cảm biến
  simulator.startSensorSimulation();

  // Xử lý thoát chương trình
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down device simulator...');
    simulator.stop();
    process.exit(0);
  });
}

module.exports = DeviceSimulator;

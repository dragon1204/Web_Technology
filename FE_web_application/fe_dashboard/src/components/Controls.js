import { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";

const Controls = () => {
  const [devices, setDevices] = useState([]);

  const {
    connected,
    subscribeTo,
    deviceMode,
    switchDeviceMode,
    simulatorConnected,
    sendDeviceCommand,
  } = useSocket();

  // Map device types to icons
  const getDeviceIcon = (type) => {
    const iconMap = {
      pump: "💧",
      light: "💡",
      fan: "🌀",
      sensor: "🌡️",
    };
    return iconMap[type] || "⚙️";
  };

  // Connect to device simulator or real devices
  useEffect(() => {
    if (deviceMode === "simulator") {
      // Subscribe to simulator data
      const unsubscribe = subscribeTo("simulatorData", (message) => {
        console.log("Simulator message:", message);

        switch (message.type) {
          case "device_list":
            const formattedDevices = message.data.map((device) => ({
              id: device.id,
              name: device.name,
              type: device.type,
              status: device.status,
              location: device.location,
              icon: getDeviceIcon(device.type),
              value: device.value
                ? `${device.value}${device.unit || ""}`
                : null,
              controllable: device.controllable,
            }));
            setDevices(formattedDevices);
            break;

          case "device_update":
            setDevices((prev) =>
              prev.map((d) =>
                d.id === message.data.id
                  ? {
                      ...d,
                      status: message.data.status,
                      value: message.data.value
                        ? `${message.data.value}${message.data.unit || ""}`
                        : d.value,
                    }
                  : d
              )
            );
            break;

          case "sensor_data":
            setDevices((prev) =>
              prev.map((d) =>
                d.id === message.data.deviceId
                  ? {
                      ...d,
                      value: `${message.data.value}${message.data.unit || ""}`,
                    }
                  : d
              )
            );
            break;

          case "device_response":
            if (!message.data.success) {
              toast.error(`Lỗi thiết bị: ${message.data.message}`);
            }
            break;
        }
      });

      return unsubscribe;
    } else if (deviceMode === "real") {
      // Subscribe to real device data from backend
      const unsubscribeDeviceList = subscribeTo("deviceList", (data) => {
        console.log("Real device list:", data);
        const formattedDevices = data.map((device) => ({
          id: device.id,
          name: device.name,
          type: device.type,
          status: device.status,
          location: device.location || "Vườn",
          icon: getDeviceIcon(device.type),
          value: device.value ? `${device.value}${device.unit || ""}` : null,
          controllable: device.controllable !== false,
        }));
        setDevices(formattedDevices);
      });

      const unsubscribeDeviceStatus = subscribeTo("deviceStatus", (data) => {
        console.log("Real device status update:", data);
        setDevices((prev) =>
          prev.map((device) =>
            device.id === data.deviceId
              ? {
                  ...device,
                  status: data.status,
                  value: data.value
                    ? `${data.value}${data.unit || ""}`
                    : device.value,
                }
              : device
          )
        );
      });

      const unsubscribeSensorData = subscribeTo("sensorData", (data) => {
        console.log("Real sensor data:", data);
        setDevices((prev) =>
          prev.map((device) =>
            device.id === data.sensorId
              ? {
                  ...device,
                  value: `${data.value}${data.unit || ""}`,
                }
              : device
          )
        );
      });

      // Request device list from backend
      if (connected) {
        subscribeTo("requestDeviceList", {});
      }

      return () => {
        unsubscribeDeviceList();
        unsubscribeDeviceStatus();
        unsubscribeSensorData();
      };
    }
  }, [deviceMode, subscribeTo, connected]);

  const handleDeviceToggle = async (device) => {
    if (device.type === "sensor" || !device.controllable) {
      toast("Thiết bị này không thể điều khiển");
      return;
    }

    const newStatus = device.status === "on" ? "off" : "on";

    try {
      // Update local state immediately for better UX
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, status: newStatus } : d))
      );

      // Send command using unified method
      sendDeviceCommand(
        device.id,
        newStatus === "on" ? "turn_on" : "turn_off",
        {
          type: device.type,
        }
      );

      toast.success(`${device.name} đã ${newStatus === "on" ? "bật" : "tắt"}`);
    } catch (error) {
      console.error("Error controlling device:", error);
      toast.error("Lỗi khi điều khiển thiết bị");

      // Revert local state on error
      setDevices((prev) =>
        prev.map((d) =>
          d.id === device.id ? { ...d, status: device.status } : d
        )
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "on":
        return "#10b981";
      case "off":
        return "#6b7280";
      case "error":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "on":
        return "Đang hoạt động";
      case "off":
        return "Đã tắt";
      case "error":
        return "Lỗi";
      default:
        return "Không xác định";
    }
  };

  const DeviceCard = ({ device }) => (
    <div
      style={{
        backgroundColor: "#1a2e1a",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #28392e",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Device Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#28392e",
              borderRadius: "12px",
            }}
          >
            {device.icon}
          </div>
          <div>
            <h3
              style={{
                color: "#e0e0e0",
                fontSize: "18px",
                fontWeight: "bold",
                margin: "0 0 4px 0",
              }}
            >
              {device.name}
            </h3>
            <p
              style={{
                color: "#a0a0a0",
                fontSize: "14px",
                margin: 0,
              }}
            >
              {device.location}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: getStatusColor(device.status),
              borderRadius: "50%",
            }}
          ></div>
          <span
            style={{
              color: getStatusColor(device.status),
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {getStatusText(device.status)}
          </span>
        </div>
      </div>

      {/* Device Value (for sensors) */}
      {device.value && (
        <div
          style={{
            backgroundColor: "#28392e",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#4cbe00",
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            {device.value}
          </div>
          <div
            style={{
              color: "#a0a0a0",
              fontSize: "12px",
            }}
          >
            Giá trị hiện tại
          </div>
        </div>
      )}

      {/* Control Button */}
      {device.type !== "sensor" && device.controllable && (
        <button
          onClick={() => handleDeviceToggle(device)}
          disabled={
            (deviceMode === "simulator" && !simulatorConnected) ||
            (deviceMode === "real" && !connected)
          }
          style={{
            backgroundColor: device.status === "on" ? "#dc2626" : "#4cbe00",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor:
              (deviceMode === "simulator" && simulatorConnected) ||
              (deviceMode === "real" && connected)
                ? "pointer"
                : "not-allowed",
            opacity:
              (deviceMode === "simulator" && simulatorConnected) ||
              (deviceMode === "real" && connected)
                ? 1
                : 0.5,
            transition: "all 0.2s ease",
          }}
        >
          {device.status === "on" ? "Tắt thiết bị" : "Bật thiết bị"}
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              color: "#e0e0e0",
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 8px 0",
            }}
          >
            ⚙️ Điều khiển thiết bị
          </h1>
          <p
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Quản lý và điều khiển các thiết bị IoT trong vườn
          </p>
        </div>

        {/* Device Mode Switcher */}
        <div
          style={{
            backgroundColor: "#1a2e1a",
            border: "1px solid #28392e",
            borderRadius: "8px",
            padding: "4px",
            display: "flex",
            gap: "4px",
          }}
        >
          <button
            onClick={() => switchDeviceMode("simulator")}
            style={{
              backgroundColor:
                deviceMode === "simulator" ? "#4cbe00" : "transparent",
              color: deviceMode === "simulator" ? "white" : "#a0a0a0",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🤖 Mô phỏng
          </button>
          <button
            onClick={() => switchDeviceMode("real")}
            style={{
              backgroundColor:
                deviceMode === "real" ? "#4cbe00" : "transparent",
              color: deviceMode === "real" ? "white" : "#a0a0a0",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🔌 Thiết bị thật
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div
        style={{
          backgroundColor:
            (deviceMode === "simulator" && simulatorConnected) ||
            (deviceMode === "real" && connected)
              ? "#10b98120"
              : "#dc262620",
          border: `1px solid ${
            (deviceMode === "simulator" && simulatorConnected) ||
            (deviceMode === "real" && connected)
              ? "#10b981"
              : "#dc2626"
          }`,
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor:
                (deviceMode === "simulator" && simulatorConnected) ||
                (deviceMode === "real" && connected)
                  ? "#10b981"
                  : "#dc2626",
              borderRadius: "50%",
            }}
          ></div>
          <div>
            <div
              style={{
                color:
                  (deviceMode === "simulator" && simulatorConnected) ||
                  (deviceMode === "real" && connected)
                    ? "#10b981"
                    : "#dc2626",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              {deviceMode === "simulator"
                ? simulatorConnected
                  ? "Thiết bị mô phỏng kết nối"
                  : "Mất kết nối thiết bị mô phỏng"
                : connected
                ? "Thiết bị thật kết nối"
                : "Mất kết nối thiết bị thật"}
            </div>
            <div
              style={{
                color: "#a0a0a0",
                fontSize: "14px",
              }}
            >
              {deviceMode === "simulator"
                ? simulatorConnected
                  ? "Có thể điều khiển thiết bị mô phỏng (localhost:8080)"
                  : "Không thể điều khiển thiết bị - Khởi động simulator"
                : connected
                ? "Có thể điều khiển thiết bị thật qua backend"
                : "Không thể điều khiển thiết bị - Kiểm tra kết nối backend"}
            </div>
          </div>
        </div>

        {((deviceMode === "simulator" && !simulatorConnected) ||
          (deviceMode === "real" && !connected)) && (
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#4cbe00",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Kết nối lại
          </button>
        )}
      </div>

      {/* Device Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #28392e",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#4cbe00",
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {devices.filter((d) => d.status === "on").length}
          </div>
          <div
            style={{
              color: "#e0e0e0",
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "4px",
            }}
          >
            Đang hoạt động
          </div>
          <div
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
            }}
          >
            Thiết bị
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #28392e",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#6b7280",
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {devices.filter((d) => d.status === "off").length}
          </div>
          <div
            style={{
              color: "#e0e0e0",
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "4px",
            }}
          >
            Đã tắt
          </div>
          <div
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
            }}
          >
            Thiết bị
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #28392e",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#f59e0b",
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {devices.length}
          </div>
          <div
            style={{
              color: "#e0e0e0",
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "4px",
            }}
          >
            Tổng số
          </div>
          <div
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
            }}
          >
            Thiết bị
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>

      {/* Help Text */}
      <div
        style={{
          backgroundColor: "#1a2e1a",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #28392e",
          marginTop: "30px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "#a0a0a0",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          {deviceMode === "simulator" ? (
            <>
              🤖 <strong>Chế độ mô phỏng:</strong> Các thiết bị được điều khiển
              thông qua Device Simulator chạy trên WebSocket (localhost:8080).
              Cảm biến sẽ tự động cập nhật dữ liệu theo thời gian thực.
              <br />
              💡 <strong>Lưu ý:</strong> Đảm bảo Device Simulator đang chạy để
              có thể điều khiển thiết bị.
            </>
          ) : (
            <>
              🔌 <strong>Chế độ thiết bị thật:</strong> Các thiết bị được điều
              khiển thông qua backend WebSocket. Thiết bị phải được kết nối và
              đăng ký với hệ thống.
              <br />
              💡 <strong>Lưu ý:</strong> Đảm bảo thiết bị IoT đã được kết nối
              với backend và đăng ký đúng gardenId.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;

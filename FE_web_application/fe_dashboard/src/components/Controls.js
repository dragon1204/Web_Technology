import React, { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";

const Controls = () => {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "Máy bơm nước 1",
      type: "pump",
      status: "off",
      location: "Vườn A",
      icon: "💧",
    },
    {
      id: 2,
      name: "Đèn LED 1",
      type: "light",
      status: "on",
      location: "Vườn A",
      icon: "💡",
    },
    {
      id: 3,
      name: "Quạt thông gió",
      type: "fan",
      status: "off",
      location: "Vườn B",
      icon: "🌀",
    },
    {
      id: 4,
      name: "Cảm biến nhiệt độ",
      type: "sensor",
      status: "on",
      location: "Vườn A",
      icon: "🌡️",
      value: "25°C",
    },
    {
      id: 5,
      name: "Cảm biến độ ẩm",
      type: "sensor",
      status: "on",
      location: "Vườn B",
      icon: "💨",
      value: "65%",
    },
  ]);

  const { connected, emit, subscribeTo } = useSocket();

  useEffect(() => {
    // Subscribe to device status updates
    const unsubscribe = subscribeTo("deviceStatus", (data) => {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === data.deviceId
            ? { ...device, status: data.status, value: data.value }
            : device
        )
      );
    });

    return unsubscribe;
  }, [subscribeTo]);

  const handleDeviceToggle = async (device) => {
    if (device.type === "sensor") {
      toast.info("Cảm biến không thể điều khiển");
      return;
    }

    const newStatus = device.status === "on" ? "off" : "on";

    try {
      // Update local state immediately for better UX
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, status: newStatus } : d))
      );

      // Send command via WebSocket if connected
      if (connected) {
        emit("deviceControl", {
          deviceId: device.id,
          command: newStatus,
          type: device.type,
        });
      }

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
      {device.type !== "sensor" && (
        <button
          onClick={() => handleDeviceToggle(device)}
          disabled={!connected}
          style={{
            backgroundColor: device.status === "on" ? "#dc2626" : "#4cbe00",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: connected ? "pointer" : "not-allowed",
            opacity: connected ? 1 : 0.5,
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
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            color: "#e0e0e0",
            fontSize: "24px",
            fontWeight: "bold",
            margin: "0 0 8px 0",
          }}
        >
          Điều khiển thiết bị
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

      {/* Connection Status */}
      <div
        style={{
          backgroundColor: connected ? "#10b98120" : "#dc262620",
          border: `1px solid ${connected ? "#10b981" : "#dc2626"}`,
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
              backgroundColor: connected ? "#10b981" : "#dc2626",
              borderRadius: "50%",
            }}
          ></div>
          <div>
            <div
              style={{
                color: connected ? "#10b981" : "#dc2626",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              {connected ? "Kết nối thành công" : "Mất kết nối"}
            </div>
            <div
              style={{
                color: "#a0a0a0",
                fontSize: "14px",
              }}
            >
              {connected
                ? "Có thể điều khiển thiết bị từ xa"
                : "Không thể điều khiển thiết bị"}
            </div>
          </div>
        </div>

        {!connected && (
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
          💡 <strong>Lưu ý:</strong> Các thiết bị được điều khiển thông qua kết
          nối WebSocket. Đảm bảo kết nối ổn định để có thể điều khiển thiết bị
          từ xa.
          <br />
          Cảm biến sẽ tự động cập nhật dữ liệu theo thời gian thực.
        </div>
      </div>
    </div>
  );
};

export default Controls;

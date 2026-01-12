import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { config } from "../config";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState({});
  const [deviceMode, setDeviceMode] = useState("real"); // "simulator" or "real"
  const [simulatorWs, setSimulatorWs] = useState(null);
  const [simulatorConnected, setSimulatorConnected] = useState(false);
  const simulatorListenersRef = useRef([]); // Use ref instead of state
  const { user, token } = useAuth();

  // Main Socket.IO connection for backend
  useEffect(() => {
    if (user && token) {
      const newSocket = io(config.API_BASE_URL, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Socket.IO connected:", newSocket.id);
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
        setConnected(false);
      });

      // Listen for sensor data updates from real devices
      newSocket.on("sensorData", (data) => {
        console.log("Received sensor data from backend:", data);
        setSensorData((prevData) => ({
          ...prevData,
          [data.sensorId]: data,
        }));
      });

      // Listen for device status updates from real devices
      newSocket.on("deviceStatus", (data) => {
        console.log("Device status update from backend:", data);
      });

      // Listen for device list from backend
      newSocket.on("deviceList", (data) => {
        console.log("Device list from backend:", data);
      });

      // Listen for notifications
      newSocket.on("notification", (notification) => {
        console.log("New notification:", notification);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  // Simulator WebSocket connection (only when deviceMode is "simulator")
  useEffect(() => {
    if (deviceMode !== "simulator") {
      // Ensure any existing simulator connection is closed
      if (simulatorWs) {
        simulatorWs.close();
      }
      return;
    }

    const connectToSimulator = () => {
      try {
        const ws = new WebSocket(config.SIMULATOR_WS_URL);

        ws.onopen = () => {
          console.log("Connected to device simulator");
          setSimulatorConnected(true);
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log("Simulator message:", message);

          // Broadcast to all simulator listeners
          simulatorListenersRef.current.forEach((listener) => {
            listener(message);
          });
        };

        ws.onclose = () => {
          console.log("Disconnected from device simulator");
          setSimulatorConnected(false);

          // Try to reconnect after 5 seconds
          setTimeout(connectToSimulator, 5000);
        };

        ws.onerror = (error) => {
          console.error("Simulator WebSocket error:", error);
          setSimulatorConnected(false);
        };

        setSimulatorWs(ws);
      } catch (error) {
        console.error("Failed to connect to simulator:", error);
        setSimulatorConnected(false);
      }
    };

    connectToSimulator();

    return () => {
      if (simulatorWs) {
        simulatorWs.close();
      }
    };
  }, [deviceMode]);

  const subscribeTo = (event, callback) => {
    if (event === "simulatorData") {
      // Subscribe to simulator messages
      simulatorListenersRef.current.push(callback);
      return () => {
        simulatorListenersRef.current = simulatorListenersRef.current.filter(
          (cb) => cb !== callback
        );
      };
    } else if (socket) {
      // Subscribe to Socket.IO events
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {}; // Return empty cleanup function if no subscription
  };

  const emit = (event, data) => {
    if (deviceMode === "simulator" && simulatorWs && simulatorConnected) {
      // Send to simulator
      console.log("Sending to simulator:", { event, data });
      simulatorWs.send(JSON.stringify({ type: event, data }));
    } else if (deviceMode === "real" && socket && connected) {
      // Send to backend for real devices
      console.log("Sending to backend:", { event, data });
      socket.emit(event, data);
    }
  };

  const sendDeviceCommand = (deviceId, command, params = {}) => {
    const payload = {
      deviceId,
      command,
      ...params,
    };

    if (deviceMode === "simulator" && simulatorWs && simulatorConnected) {
      simulatorWs.send(
        JSON.stringify({
          deviceId,
          action: command,
          ...params,
        })
      );
    } else if (deviceMode === "real" && socket && connected) {
      socket.emit("deviceControl", payload);
    }
  };

  const switchDeviceMode = (mode) => {
    console.log("Switching device mode to:", mode);
    setDeviceMode(mode);
  };

  const value = {
    socket,
    connected,
    sensorData,
    subscribeTo,
    emit,
    deviceMode,
    switchDeviceMode,
    simulatorWs,
    simulatorConnected,
    sendDeviceCommand,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

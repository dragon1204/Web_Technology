import React, { createContext, useContext, useEffect, useState } from "react";
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
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(config.API_BASE_URL, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnected(false);
      });

      // Listen for sensor data updates
      newSocket.on("sensorData", (data) => {
        console.log("Received sensor data:", data);
        setSensorData((prevData) => ({
          ...prevData,
          [data.sensorId]: data,
        }));
      });

      // Listen for device status updates
      newSocket.on("deviceStatus", (data) => {
        console.log("Device status update:", data);
        // Handle device status updates
      });

      // Listen for notifications
      newSocket.on("notification", (notification) => {
        console.log("New notification:", notification);
        // Handle real-time notifications
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const subscribeTo = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  };

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    sensorData,
    subscribeTo,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

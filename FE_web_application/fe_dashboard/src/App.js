import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PlantManagement from "./components/PlantManagement";
import Controls from "./components/Controls";
import GardenView from "./components/GardenView";
import Layout from "./components/Layout";
import OAuthCallback from "./components/OAuthCallback";
import "./App.css";

function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  console.log(
    "ProtectedRoute - user:",
    user,
    "loading:",
    loading,
    "isAuthenticated:",
    isAuthenticated
  ); // Debug log

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#102216",
          color: "white",
        }}
      >
        <div
          style={{
            width: "2rem",
            height: "2rem",
            border: "2px solid #28392e",
            borderTop: "2px solid #4cbe00",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    console.log("Redirecting to login - no user or not authenticated"); // Debug log
    return <Navigate to="/login" replace />;
  }

  console.log("Rendering protected content for user:", user.email || user.name); // Debug log
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/garden"
                element={
                  <ProtectedRoute>
                    <GardenView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plants"
                element={
                  <ProtectedRoute>
                    <PlantManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/controls"
                element={
                  <ProtectedRoute>
                    <Controls />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1a2e1a",
                  color: "#e0e0e0",
                  border: "1px solid #28392e",
                },
                success: {
                  iconTheme: {
                    primary: "#4cbe00",
                    secondary: "#e0e0e0",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#dc2626",
                    secondary: "#e0e0e0",
                  },
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

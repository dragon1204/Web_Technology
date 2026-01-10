import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Dashboard from "./components/Dashboard";
import GardenList from "./components/admin/AdminGardenList";
import UserList from "./components/admin/UserList";
import VegetableList from "./components/user/VegetableList";
import RevenuePage from "./components/user/RevenuePage";
import Sidebar from "./components/common/Sidebar";
import Login from "./components/common/Login";
import MyGardenList from "./components/user/MyGardenList";

// New components for complete API integration
import RevenueAnalytics from "./components/analytics/RevenueAnalytics";
import NotificationCenter from "./components/notifications/NotificationCenter";
import AlertsManager from "./components/alerts/AlertsManager";
import AuditLogs from "./components/audit/AuditLogs";
import VegetableManager from "./components/vegetables/VegetableManager";
import OAuthCallback from "./components/auth/OAuthCallback";

// Context providers
import { AuthProvider } from "./hooks/useAuth";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
    },
    secondary: {
      main: "#2196F3",
    },
  },
});

const Layout = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: "20px" }}>{children}</main>
    </div>
  );
};

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem("token") !== null;
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? (
      <Layout>{children}</Layout>
    ) : (
      <Navigate to="/login" />
    );
  };

  const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.role === "ADMIN";
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gardens"
              element={
                <ProtectedRoute>
                  {isAdmin() ? <GardenList /> : <MyGardenList />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/vegetables"
              element={
                <ProtectedRoute>
                  <VegetableList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vegetable-manager"
              element={
                <ProtectedRoute>
                  <VegetableManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={
                <ProtectedRoute>
                  <RevenuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <RevenueAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <AlertsManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

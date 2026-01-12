import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import OAuthCallback from "./components/OAuthCallback";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import UserList from "./components/Users/UserList";
import GardenList from "./components/Gardens/GardenList";
import VegetableList from "./components/Vegetables/VegetableList";
import RevenuePage from "./components/Revenue/RevenuePage";
import NotificationsPage from "./components/Notifications/NotificationsPage";
import AlertsPage from "./components/Alerts/AlertsPage";
import ForgotPassword from "./components/Security/ForgotPassword";
import ResetPassword from "./components/Security/ResetPassword";
import TwoFactorAuth from "./components/Security/TwoFactorAuth";
import SecuritySettings from "./components/Security/SecuritySettings";
import AccountSettings from "./components/AccountSettings";
import Controls from "./components/Controls";

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

function App() {
  const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#102216",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ color: "#4cbe00", fontSize: "18px" }}>Loading...</div>
        </div>
      );
    }
    
    return isAuthenticated ? (
      <Layout>{children}</Layout>
    ) : (
      <Navigate to="/login" />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/redirect" element={<OAuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
                <GardenList />
              </ProtectedRoute>
            }
          />
          <Route path="/garden" element={<Navigate to="/gardens" replace />} />
          <Route
            path="/controls"
            element={
              <ProtectedRoute>
                <Controls />
              </ProtectedRoute>
            }
          />
          <Route path="/plants" element={<Navigate to="/vegetables" replace />} />
          <Route
            path="/vegetables"
            element={
              <ProtectedRoute>
                <VegetableList />
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
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <SecuritySettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/2fa"
            element={
              <ProtectedRoute>
                <TwoFactorAuth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

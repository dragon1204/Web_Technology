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
import { AdminLayout, UserLayout, CustomerLayout } from "./components/Layouts";
import Dashboard from "./components/Dashboard";
import UserList from "./components/Users/UserList";
import GardenList from "./components/Gardens/GardenList";
import GardenDashboard from "./components/Gardens/GardenDashboard";
import VegetableList from "./components/Vegetables/VegetableList";
import RevenuePage from "./components/Revenue/RevenuePage";
import NotificationsPage from "./components/Notifications/NotificationsPage";
import AlertsPage from "./components/Alerts/AlertsPage";
import ForgotPassword from "./components/Security/ForgotPassword";
import ResetPassword from "./components/Security/ResetPassword";
import TwoFactorAuth from "./components/Security/TwoFactorAuth";
import SecuritySettings from "./components/Security/SecuritySettings";
import AccountSettings from "./components/AccountSettings";

import AuditLogs from "./components/AuditLogs.jsx";
import Controls from "./components/Controls";
import { 
  ShopList, 
  ProductList, 
  ShoppingCart, 
  Checkout, 
  OrderHistory, 
  OrderDetail 
} from "./components/Customer";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4cbe00",
      dark: "#2d8e00",
      light: "#7dd62f",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ffffff",
      dark: "#f0f0f0",
      light: "#ffffff",
      contrastText: "#2d8e00",
    },
    background: {
      default: "#f8fcf8", // Very light mint white
      paper: "#ffffff",
    },
    text: {
      primary: "#1a2e1a", // Dark green-black
      secondary: "#666666",
    },
    success: {
      main: "#4cbe00",
    },
    error: {
      main: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#0ea5e9",
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell'",
    h4: {
      fontWeight: 700,
      color: "#1a2e1a",
    },
    h5: {
      fontWeight: 700,
      color: "#1a2e1a",
    },
    body1: {
      color: "#333333",
    },
    body2: {
      color: "#555555",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: "0 2px 4px rgba(76, 190, 0, 0.2)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(76, 190, 0, 0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#e8f5e9", // Light green for table headers
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#1a2e1a",
          fontWeight: 600,
        },
      },
    },
  },
});

// Component để chọn layout dựa trên role
function RoleBasedLayout({ children }) {
  const { user } = useAuth();
  
  const userRole = user?.role || user?.data?.role || "USER";
  
  if (userRole === "ADMIN") {
    return <AdminLayout>{children}</AdminLayout>;
  } else if (userRole === "CUSTOMER") {
    return <CustomerLayout>{children}</CustomerLayout>;
  } else {
    // USER hoặc mặc định
    return <UserLayout>{children}</UserLayout>;
  }
}

// Component để redirect dựa trên role
function RoleBasedRedirect() {
  const { user } = useAuth();
  const userRole = user?.role || user?.data?.role || "USER";
  
  if (userRole === "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  } else if (userRole === "CUSTOMER") {
    return <Navigate to="/customer/shops" replace />;
  } else {
    // USER hoặc mặc định
    return <Navigate to="/dashboard" replace />;
  }
}

function App() {
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();
    if (loading) {
      return (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#1a3a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ color: "#4cbe00", fontSize: "18px" }}>Loading...</div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    // Kiểm tra role nếu có yêu cầu
    if (allowedRoles.length > 0) {
      const userRole = user?.role || user?.data?.role || "USER";
      if (!allowedRoles.includes(userRole)) {
        // Redirect dựa trên role
        if (userRole === "CUSTOMER") {
          return <Navigate to="/customer/shops" replace />;
        }
        return <Navigate to="/dashboard" replace />;
      }
    }
    
    return <RoleBasedLayout>{children}</RoleBasedLayout>;
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
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gardens"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <GardenList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gardens/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <GardenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controls"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <Controls />
              </ProtectedRoute>
            }
          />
          <Route path="/garden" element={<Navigate to="/gardens" replace />} />
          <Route
            path="/plants" element={<Navigate to="/vegetables" replace />} />
          <Route
            path="/vegetables"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <VegetableList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <RevenuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
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
          <Route path="/2fa" element={<Navigate to="/security/2fa" replace />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          {/* Customer Routes */}
          <Route
            path="/customer/shops"
            element={
              <ProtectedRoute>
                <ShopList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/products"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/products/:shopId"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/cart"
            element={
              <ProtectedRoute>
                <ShoppingCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/checkout/:shopId"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

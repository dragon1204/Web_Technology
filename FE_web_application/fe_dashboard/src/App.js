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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
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
                {JSON.parse(localStorage.getItem("user"))?.role === "ADMIN" ? (
                  <GardenList />
                ) : (
                  <MyGardenList />
                )}
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
            path="/revenue"
            element={
              <ProtectedRoute>
                <RevenuePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug authentication status
  useEffect(() => {
    console.log("Layout: User:", user);
    console.log("Layout: Token:", token ? "exists" : "none");
    console.log("Layout: Token value:", token);
    console.log("Layout: localStorage token:", localStorage.getItem("token"));
  }, [user, token]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const menuItems = [
    {
      path: "/",
      name: "Dashboard",
      icon: "📊",
    },
    {
      path: "/garden",
      name: "Quản lý vườn",
      icon: "🌱",
    },
    {
      path: "/plants",
      name: "Quản lý cây trồng",
      icon: "🌿",
    },

    {
      path: "/users",
      name: "Quản lý người dùng",
      icon: "👥",
      adminOnly: true,
    },
    {
      path: "/audit-logs",
      name: "Nhật ký hoạt động",
      icon: "📋",
    },
    {
      path: "/2fa",
      name: "Xác thực 2FA",
      icon: "🔐",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fcf8", // Light mint background
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "250px" : "60px",
          backgroundColor: "#ffffff", // White sidebar
          transition: "width 0.3s ease",
          borderRight: "1px solid #e5e7eb", // Light border
          position: "relative",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #f0f0f0",
            textAlign: sidebarOpen ? "left" : "center",
          }}
        >
          <h2
            style={{
              color: "#4cbe00",
              fontSize: sidebarOpen ? "20px" : "18px",
              fontWeight: "800",
              margin: 0,
            }}
          >
            {sidebarOpen ? "Garden IoT" : "🌱"}
          </h2>
        </div>

        {/* Menu Items */}
        <nav style={{ padding: "20px 0" }}>
          {menuItems
            .filter(
              (item) =>
                !item.adminOnly ||
                user?.role === "ADMIN" ||
                user?.data?.role === "ADMIN"
            )
            .map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  backgroundColor: isActive(item.path)
                    ? "#e8f5e9" // Light green active bg
                    : "transparent",
                  border: "none",
                  borderLeft: isActive(item.path) ? "4px solid #4cbe00" : "4px solid transparent",
                  color: isActive(item.path) ? "#2d8e00" : "#666666",
                  fontSize: "14px",
                  fontWeight: isActive(item.path) ? "600" : "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                    e.currentTarget.style.color = "#4cbe00";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#666666";
                  }
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: "24px",
            right: "-12px",
            width: "24px",
            height: "24px",
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "50%",
            color: "#4cbe00",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            zIndex: 20,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: "#ffffff",
            padding: "15px 30px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <div>
            <h1
              style={{
                color: "#1a2e1a",
                fontSize: "22px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {menuItems.find((item) => item.path === location.pathname)
                ?.name || "Dashboard"}
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* User Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: "#f9fafb",
                border: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2d8e00",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {(
                  user?.name ||
                  user?.data?.name ||
                  user?.email ||
                  user?.data?.email ||
                  "U"
                )
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  {user?.name ||
                    user?.data?.name ||
                    user?.email ||
                    user?.data?.email ||
                    "User"}
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  {user?.role || user?.data?.role || "USER"}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#fecaca";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#fee2e2";
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: "30px",
            backgroundColor: "#f8fcf8",
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

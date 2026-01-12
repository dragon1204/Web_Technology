import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      path: "/dashboard",
      name: "Dashboard",
      icon: "📊",
    },
    {
      path: "/users",
      name: "Quản lý người dùng",
      icon: "👥",
    },
    {
      path: "/gardens",
      name: "Quản lý vườn",
      icon: "🌱",
    },
    {
      path: "/vegetables",
      name: "Quản lý cây trồng",
      icon: "🌿",
    },
    {
      path: "/revenue",
      name: "Doanh thu",
      icon: "💰",
    },
    {
      path: "/notifications",
      name: "Thông báo",
      icon: "🔔",
    },
    {
      path: "/alerts",
      name: "Cảnh báo",
      icon: "⚠️",
    },
    {
      path: "/audit-logs",
      name: "Nhật ký hoạt động",
      icon: "📋",
    },
    {
      path: "/account",
      name: "Tài khoản",
      icon: "⚙️",
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const getPageTitle = () => {
    const item = menuItems.find((item) => isActive(item.path));
    return item?.name || "Dashboard";
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#1a3a2a",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "250px" : "60px",
          backgroundColor: "#2a4a3a",
          transition: "width 0.3s ease",
          borderRight: "1px solid #3a5a4a",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #3a5a4a",
            textAlign: sidebarOpen ? "left" : "center",
          }}
        >
          <h2
            style={{
              color: "#4cbe00",
              fontSize: sidebarOpen ? "18px" : "16px",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            {sidebarOpen ? "Garden IoT - Admin" : "🌱"}
          </h2>
        </div>

        {/* Menu Items */}
        <nav style={{ padding: "20px 0" }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%",
                padding: "12px 20px",
                backgroundColor: isActive(item.path)
                  ? "#3a5a4a"
                  : "transparent",
                border: "none",
                color: isActive(item.path) ? "#4cbe00" : "#ffffff",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
              onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = "#3a5a4a";
                    e.target.style.color = "#4cbe00";
                  }
              }}
              onMouseOut={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#ffffff";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: "20px",
            right: "-15px",
            width: "30px",
            height: "30px",
            backgroundColor: "#4cbe00",
            border: "none",
            borderRadius: "50%",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            zIndex: 10,
          }}
        >
          {sidebarOpen ? "←" : "→"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: "#2a4a3a",
            padding: "15px 30px",
            borderBottom: "1px solid #3a5a4a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              {getPageTitle()}
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* User Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#4cbe00",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {(
                  user?.name ||
                  user?.data?.name ||
                  user?.email ||
                  user?.data?.email ||
                  "A"
                )
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>
                  {user?.name ||
                    user?.data?.name ||
                    user?.email ||
                    user?.data?.email ||
                    "Admin"}
                </div>
                <div style={{ fontSize: "12px", color: "#d0d0d0" }}>
                  ADMIN
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#b91c1c")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#dc2626")}
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
            backgroundColor: "#1a3a2a",
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

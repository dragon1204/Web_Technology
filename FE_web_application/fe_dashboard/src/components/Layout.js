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
      path: "/controls",
      name: "Điều khiển thiết bị",
      icon: "🎛️",
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
        backgroundColor: "#102216",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "250px" : "60px",
          backgroundColor: "#1a2e1a",
          transition: "width 0.3s ease",
          borderRight: "1px solid #28392e",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #28392e",
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
            {sidebarOpen ? "Garden IoT" : "🌱"}
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
                  ? "#28392e"
                  : "transparent",
                border: "none",
                color: isActive(item.path) ? "#4cbe00" : "#e0e0e0",
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
                  e.target.style.backgroundColor = "#28392e";
                  e.target.style.color = "#4cbe00";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#e0e0e0";
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
            backgroundColor: "#1a2e1a",
            padding: "15px 30px",
            borderBottom: "1px solid #28392e",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                color: "#e0e0e0",
                fontSize: "20px",
                fontWeight: "600",
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
              gap: "15px",
            }}
          >
            {/* User Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#e0e0e0",
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
                  "U"
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
                    "User"}
                </div>
                <div style={{ fontSize: "12px", color: "#a0a0a0" }}>
                  {user?.role || user?.data?.role || "USER"}
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
            backgroundColor: "#102216",
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

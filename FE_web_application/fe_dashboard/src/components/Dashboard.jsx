import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

// Import 2 dashboard components riêng biệt
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("=== DASHBOARD LOADING ===");

    const userData = localStorage.getItem("user");
    console.log("📋 Raw userData from localStorage:", userData);

    if (userData && userData !== "undefined" && userData !== "null") {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("👤 Parsed user:", parsedUser);
        console.log("🔑 User role:", parsedUser.role);

        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
        } else {
          console.error("❌ User data không hợp lệ");
          localStorage.clear();
        }
      } catch (error) {
        console.error("❌ Lỗi parse user data:", error);
        localStorage.clear();
      }
    } else {
      console.log("⚠️ Không có user data trong localStorage");
    }

    setLoading(false);
  }, []);

  // Đang loading
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    console.log("❌ User không tồn tại, redirect về /login");
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập - phân chia theo role
  console.log("✅ Rendering dashboard for role:", user.role);

  if (user.role === "ADMIN") {
    console.log("→ Hiển thị ADMIN Dashboard");
    return <AdminDashboard user={user} />;
  } else {
    console.log("→ Hiển thị USER Dashboard");
    return <UserDashboard user={user} />;
  }
}

export default Dashboard;

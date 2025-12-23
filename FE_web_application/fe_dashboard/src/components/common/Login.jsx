import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
} from "@mui/material";
import { LockOutlined as LockIcon } from "@mui/icons-material";
import { authAPI } from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("=== ĐANG ĐĂNG NHẬP ===");
      const response = await authAPI.login(email, password);

      console.log("Full response:", response);
      console.log("Response data:", response.data);

      // 1. Trích xuất Token
      const token =
        response.data.data?.token ||
        response.data.data?.access_token ||
        response.data.token ||
        response.data.access_token;

      console.log("Token:", token);

      if (!token) {
        console.error("Không tìm thấy Token trong response!");
        throw new Error("Login failed: Server did not return a token");
      }

      // 2. Lưu token trước để có thể gọi API
      localStorage.setItem("token", token);

      // 3. GỌI API ĐỂ LẤY THÔNG TIN USER (sử dụng endpoint /users/me)
      console.log("Đang lấy thông tin user từ /users/me...");

      try {
        // ✅ SỬ DỤNG ENDPOINT /users/me - tự động lấy user từ token
        const userResponse = await fetch(`http://localhost:3000/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userResult = await userResponse.json();
        const userData = userResult.data;

        console.log("User Info từ API:", userData);

        // 4. Tạo object user với đầy đủ thông tin
        const userToSave = {
          id: userData.id,
          username: userData.name || userData.email.split("@")[0], // Backend dùng 'name' không phải 'username'
          email: userData.email,
          role: userData.role, // ✅ Lấy role ĐÚNG từ database
        };

        console.log("User sẽ lưu vào localStorage:", userToSave);

        // 5. Lưu user vào LocalStorage
        localStorage.setItem("user", JSON.stringify(userToSave));

        console.log("✅ Đăng nhập thành công!");
        console.log("→ Role:", userToSave.role);
        console.log("→ User ID:", userToSave.id);

        // 6. Điều hướng theo Role
        if (userToSave.role === "ADMIN") {
          console.log("→ Điều hướng đến /dashboard (Admin)");
          navigate("/dashboard");
        } else {
          console.log("→ Điều hướng đến /gardens (User)");
          navigate("/gardens");
        }
      } catch (userError) {
        console.error("Lỗi khi lấy thông tin user:", userError);
        // Nếu không lấy được thông tin user, vẫn cho login nhưng với role mặc định
        const fallbackUser = {
          id: undefined,
          username: email.split("@")[0],
          email: email,
          role: "USER",
        };
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        navigate("/gardens");
      }
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      console.error("Error response:", err.response);

      // Hiển thị lỗi từ Backend
      const serverMessage = err.response?.data?.message;
      setError(
        typeof serverMessage === "string"
          ? serverMessage
          : "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "#2e7d32" }}>
                <LockIcon />
              </Avatar>
              <Typography component="h1" variant="h5" fontWeight="bold">
                Garden IOT
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Please enter your credentials
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: "bold" }}
                disabled={loading}
              >
                {loading ? "Logging in..." : "LOGIN"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;

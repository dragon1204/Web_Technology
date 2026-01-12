import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from "../config";
import toast from "react-hot-toast";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const userData = urlParams.get("user");

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem(config.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(config.STORAGE_KEYS.USER, JSON.stringify(user));
        toast.success("Đăng nhập Google thành công!");
        navigate("/");
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast.error("Lỗi xử lý đăng nhập Google");
      }
    }
  }, [location, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log("Attempting login with:", formData.email); // Debug log

        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        console.log("Login result:", result); // Debug log

        if (result.success) {
          toast.success("Đăng nhập thành công!");

          // Đợi một chút để state được cập nhật
          setTimeout(() => {
            console.log("Navigating to dashboard..."); // Debug log
            navigate("/");
          }, 100);
        } else {
          toast.error(result.error || "Đăng nhập thất bại");
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp");
          return;
        }

        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (result.success) {
          toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: "",
            name: "",
            confirmPassword: "",
          });
        } else {
          toast.error(result.error || "Đăng ký thất bại");
        }
      }
    } catch (error) {
      console.error("Submit error:", error); // Debug log
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = config.GOOGLE_AUTH_URL;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#102216",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a2e1a",
          padding: "40px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              color: "#4cbe00",
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
            }}
          >
            Garden IoT Dashboard
          </h1>
          <p
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {isLogin ? "Đăng nhập vào tài khoản của bạn" : "Tạo tài khoản mới"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Họ tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#28392e",
                  border: "1px solid #3a4a3a",
                  borderRadius: "6px",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Nhập họ tên của bạn"
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#e0e0e0",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28392e",
                border: "1px solid #3a4a3a",
                borderRadius: "6px",
                color: "#e0e0e0",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#e0e0e0",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28392e",
                border: "1px solid #3a4a3a",
                borderRadius: "6px",
                color: "#e0e0e0",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Nhập mật khẩu"
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#28392e",
                  border: "1px solid #3a4a3a",
                  borderRadius: "6px",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#2a5a2a" : "#4cbe00",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "20px",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>

          <div
            style={{
              textAlign: "center",
              margin: "20px 0",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "1px",
                backgroundColor: "#3a4a3a",
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
              }}
            ></div>
            <span
              style={{
                backgroundColor: "#1a2e1a",
                color: "#a0a0a0",
                padding: "0 15px",
                fontSize: "14px",
                position: "relative",
              }}
            >
              hoặc
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#ffffff",
              color: "#333333",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Tiếp tục với Google
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: "none",
              border: "none",
              color: "#4cbe00",
              fontSize: "14px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isLogin
              ? "Chưa có tài khoản? Đăng ký ngay"
              : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

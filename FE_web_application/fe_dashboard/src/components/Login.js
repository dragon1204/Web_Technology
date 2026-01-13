import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from "../config";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");

  const { login, isAuthenticated } = useAuth();
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
      console.log("Attempting login with:", formData.email);

      if (twoFARequired && !twoFACode) {
        toast.error("Vui lòng nhập mã 2FA (6 chữ số)");
        setLoading(false);
        return;
      }

      const result = await login({
        email: formData.email,
        password: formData.password,
        totpCode: twoFARequired ? twoFACode : undefined,
      });

      console.log("Login result:", result);

      if (result && result.requires2FA === true) {
        // Bước 1: backend yêu cầu mã 2FA
        console.log("2FA required, showing 2FA input");
        setTwoFARequired(true);
        setTwoFACode("");
        toast.success(
          "Tài khoản này đã bật 2FA. Vui lòng nhập mã 6 chữ số từ ứng dụng Authenticator."
        );
        setLoading(false);
        return; // Dừng lại, chờ user nhập mã 2FA
      } else if (result && result.success === true) {
        // Bước 2: Login thành công sau khi verify 2FA hoặc không có 2FA
        console.log("Login successful, redirecting...");
        toast.success("Đăng nhập thành công!");
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        // Lỗi khác
        console.error("Login failed:", result);
        toast.error(result?.error || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Submit error:", error);
      // Show the exact error message bubbled up from auth layer
      toast.error(error?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
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
            Đăng nhập vào tài khoản của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => {
                  toast("Tính năng quên mật khẩu đang được phát triển. Vui lòng liên hệ admin.");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4cbe00",
                  fontSize: "12px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
                onMouseOver={(e) => (e.target.style.color = "#6dd400")}
                onMouseOut={(e) => (e.target.style.color = "#4cbe00")}
              >
                Quên mật khẩu?
              </button>
            </div>
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

          {twoFARequired && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Mã 2FA (6 chữ số)
              </label>
              <input
                type="text"
                name="totpCode"
                value={twoFACode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                  setTwoFACode(value);
                }}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#28392e",
                  border: "1px solid #3a4a3a",
                  borderRadius: "6px",
                  color: "#e0e0e0",
                  fontSize: "18px",
                  boxSizing: "border-box",
                  letterSpacing: "4px",
                  textAlign: "center",
                }}
                placeholder="••••••"
              />
              <p
                style={{
                  marginTop: "6px",
                  color: "#a0a0a0",
                  fontSize: "12px",
                }}
              >
                Lấy mã trong ứng dụng Google Authenticator hoặc Authy.
              </p>
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
            {loading
              ? "Đang xử lý..."
              : twoFARequired
              ? "Xác nhận mã 2FA"
              : "Đăng nhập"}
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
              Hoặc
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
              transition: "background-color 0.2s",
              marginBottom: "20px",
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
            Đăng nhập bằng Google
          </button>

          <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #3a4a3a" }}>
            <p style={{ color: "#a0a0a0", fontSize: "14px", margin: 0 }}>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  toast("Tính năng đăng ký đang được phát triển. Vui lòng liên hệ admin.");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4cbe00",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  fontWeight: "500",
                }}
                onMouseOver={(e) => (e.target.style.color = "#6dd400")}
                onMouseOut={(e) => (e.target.style.color = "#4cbe00")}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

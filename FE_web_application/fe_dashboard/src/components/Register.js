import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { config } from "../config";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

const Register = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [formData, setFormData] = useState({
    email: "",
    otpCode: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.sendOtp(formData.email, "REGISTER");
      if (response.data?.success || response.data?.data) {
        setOtpSent(true);
        setStep(2);
        toast.success("OTP đã được gửi! Vui lòng kiểm tra email (hoặc console để test).");
        // Log OTP code for testing (only in development)
        if (response.data?.data?.code) {
          console.log("🔐 OTP Code:", response.data.data.code);
        }
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err) {
      let errorMsg = "Không thể gửi mã OTP. Vui lòng thử lại.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(
        formData.email,
        formData.otpCode,
        "REGISTER"
      );
      if (response.data?.success || response.data?.data) {
        setStep(3);
        toast.success("Mã OTP hợp lệ! Vui lòng nhập thông tin tài khoản.");
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (err) {
      let errorMsg = "Mã OTP không hợp lệ hoặc đã hết hạn.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register with password
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      toast.error("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.registerWithOtp({
        email: formData.email,
        code: formData.otpCode,
        password: formData.password,
        name: formData.name,
      });

      if (result.data?.success || result.data?.data) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      let errorMsg = "Đăng ký thất bại. Vui lòng thử lại.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.sendOtp(formData.email, "REGISTER");
      if (response.data?.success || response.data?.data) {
        toast.success("Đã gửi lại mã OTP!");
        if (response.data?.data?.code) {
          console.log("🔐 New OTP Code:", response.data.data.code);
        }
      }
    } catch (err) {
      let errorMsg = "Không thể gửi lại mã OTP.";
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data?.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data?.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data?.error === "string") {
          errorMsg = data.error;
        }
      } else if (typeof err?.message === "string") {
        errorMsg = err.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
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
            Đăng Ký Tài Khoản
          </h1>
          <p
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {step === 1 && "Nhập email để nhận mã OTP"}
            {step === 2 && "Nhập mã OTP đã gửi đến email"}
            {step === 3 && "Nhập thông tin tài khoản"}
          </p>
        </div>

        {/* Progress Steps */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
            position: "relative",
          }}
        >
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor:
                    step >= s ? "#4cbe00" : step > s ? "#4cbe00" : "#3a4a3a",
                  color: step >= s ? "white" : "#a0a0a0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  margin: "0 auto",
                  border: step >= s ? "2px solid #4cbe00" : "2px solid #3a4a3a",
                }}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "50%",
                    width: "100%",
                    height: "2px",
                    backgroundColor:
                      step > s ? "#4cbe00" : "#3a4a3a",
                    zIndex: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              backgroundColor: "#4a1a1a",
              border: "1px solid #e74c3c",
              borderRadius: "6px",
              color: "#ff6b6b",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            <strong>⚠️ Lỗi:</strong> {typeof error === "string" ? error : typeof error === "object" ? JSON.stringify(error) : String(error)}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
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
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                name="otpCode"
                value={formData.otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                  setFormData({ ...formData, otpCode: value });
                  setError("");
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
                Mã OTP đã được gửi đến {formData.email}
              </p>
            </div>

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
                marginBottom: "10px",
                transition: "background-color 0.2s",
              }}
            >
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "transparent",
                color: "#4cbe00",
                border: "1px solid #4cbe00",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: "20px",
                transition: "all 0.2s",
              }}
            >
              Gửi lại mã OTP
            </button>
          </form>
        )}

        {/* Step 3: Password & Name */}
        {step === 3 && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Họ và tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
                placeholder="Nhập họ và tên"
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
                minLength={8}
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
                placeholder="Tối thiểu 8 ký tự"
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
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={8}
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
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #3a4a3a" }}>
          <p style={{ color: "#a0a0a0", fontSize: "14px", margin: 0 }}>
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              style={{
                color: "#4cbe00",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

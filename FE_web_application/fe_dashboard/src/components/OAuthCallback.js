import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");

        if (!token || !userParam) {
          toast.error("Thông tin đăng nhập không hợp lệ");
          navigate("/login", { replace: true });
          return;
        }

        // Decode user data
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Also save refresh_token if provided
        const refreshToken = searchParams.get("refresh_token");
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Update AuthContext state immediately
        if (auth && typeof auth.setAuthState === 'function') {
          auth.setAuthState(token, userData);
          console.log("✅ Auth state updated via setAuthState");
        } else {
          console.warn("⚠️ setAuthState not available, using fallback");
        }

        toast.success("Đăng nhập Google thành công!");
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast.error("Lỗi xử lý đăng nhập Google");
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#102216",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a2e1a",
          padding: "40px",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #28392e",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #28392e",
            borderTop: "3px solid #4cbe00",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}
        ></div>
        <h2
          style={{
            color: "#e0e0e0",
            fontSize: "18px",
            fontWeight: "600",
            margin: "0 0 10px 0",
          }}
        >
          Đang xử lý đăng nhập...
        </h2>
        <p
          style={{
            color: "#a0a0a0",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Vui lòng chờ trong giây lát
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;

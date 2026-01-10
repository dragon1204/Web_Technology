import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");

        if (!token || !userParam) {
          toast.error("Thông tin đăng nhập không hợp lệ");
          navigate("/login");
          return;
        }

        // Decode user data
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Handle OAuth callback
        await authService.handleOAuthCallback(token, userData);

        toast.success("Đăng nhập Google thành công!");
        navigate("/");
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast.error("Lỗi xử lý đăng nhập Google");
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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

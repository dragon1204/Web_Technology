import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import "../styles/TwoFactorAuth.css";

const TwoFactorAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const profile = await authService.getProfile();
      setTwoFactorEnabled(profile.twoFactorEnabled || false);
    } catch (err) {
      console.error("Error checking 2FA status:", err);
    }
  };

  const handleGenerate2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log("TwoFactorAuth: Generating 2FA secret...");
      const response = await authService.generate2FA();
      console.log("TwoFactorAuth: Generate response:", response);

      setSecret(response.secret || response.data?.secret);
      setShowSetup(true);

      // Get QR code after generating secret
      try {
        console.log("TwoFactorAuth: Getting QR code...");
        const qrResponse = await authService.get2FAQRCode();
        console.log("TwoFactorAuth: QR response:", qrResponse);
        setQrCodeUrl(
          qrResponse.qrCodeUrl ||
            qrResponse.data?.qrCodeUrl ||
            qrResponse.qrCode
        );
      } catch (qrError) {
        console.error("TwoFactorAuth: QR code error:", qrError);
        // QR code is optional, can continue without it
      }
    } catch (err) {
      console.error("TwoFactorAuth: Generate error:", err);
      const errorMessage = err.message || "Không thể tạo mã 2FA";
      setError(errorMessage);
      setShowSetup(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();

    if (!totpCode || totpCode.length !== 6) {
      setError("Vui lòng nhập mã 6 chữ số");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log("TwoFactorAuth: Enabling 2FA with code:", totpCode);
      await authService.enable2FA(totpCode);

      setSuccess("2FA đã được kích hoạt thành công!");
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setTotpCode("");
      setSecret(null);
      setQrCodeUrl(null);

      // Refresh profile to update 2FA status
      await checkTwoFactorStatus();
    } catch (err) {
      console.error("TwoFactorAuth: Enable error:", err);
      const errorMessage =
        err.message || "Không thể kích hoạt 2FA. Vui lòng kiểm tra lại mã.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Bạn có chắc muốn tắt xác thực 2 yếu tố?")) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log("TwoFactorAuth: Disabling 2FA...");
      await authService.disable2FA();

      setSuccess("2FA đã được tắt!");
      setTwoFactorEnabled(false);

      // Refresh profile
      await checkTwoFactorStatus();
    } catch (err) {
      console.error("TwoFactorAuth: Disable error:", err);
      const errorMessage = err.message || "Không thể tắt 2FA";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-factor-auth">
      <h2>Xác Thực 2 Yếu Tố (2FA)</h2>

      {error && (
        <div className="error-message">
          {typeof error === "object" ? JSON.stringify(error) : error}
        </div>
      )}
      {success && <div className="success-message">{success}</div>}

      <div className="status-section">
        <p>
          Trạng thái:{" "}
          <strong>
            {twoFactorEnabled ? "Đã kích hoạt ✓" : "Chưa kích hoạt"}
          </strong>
        </p>

        {!twoFactorEnabled && !showSetup && (
          <button
            className="btn-primary"
            onClick={handleGenerate2FA}
            disabled={loading}
          >
            Kích Hoạt 2FA
          </button>
        )}

        {twoFactorEnabled && (
          <button
            className="btn-danger"
            onClick={handleDisable2FA}
            disabled={loading}
          >
            Tắt 2FA
          </button>
        )}
      </div>

      {showSetup && (
        <div className="setup-section">
          <h3>Thiết Lập 2FA</h3>
          <div className="setup-steps">
            <div className="step">
              <h4>Bước 1: Quét mã QR</h4>
              <p>
                Sử dụng ứng dụng xác thực (Google Authenticator, Authy, v.v.) để
                quét mã QR này:
              </p>
              {qrCodeUrl && (
                <div className="qr-code">
                  <img src={qrCodeUrl} alt="QR Code" />
                </div>
              )}
            </div>

            <div className="step">
              <h4>Bước 2: Hoặc nhập mã thủ công</h4>
              <p>Nếu không thể quét QR, hãy nhập mã này vào ứng dụng:</p>
              {secret ? (
                <code className="secret-code">{secret}</code>
              ) : (
                <div
                  style={{
                    padding: "10px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Đang tải mã...
                </div>
              )}
            </div>

            <div className="step">
              <h4>Bước 3: Xác nhận</h4>
              <p>Nhập mã 6 chữ số từ ứng dụng xác thực:</p>
              <form onSubmit={handleEnable2FA}>
                <input
                  type="text"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    Xác Nhận
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowSetup(false);
                      setTotpCode("");
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { gardenService } from "../services/gardenService";
import { vegetableService } from "../services/vegetableService";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGardens: 0,
    totalVegetables: 0,
    totalRevenue: 0,
    recentSales: 0,
  });
  const [gardens, setGardens] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { connected, sensorData } = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch gardens with proper pagination
      const gardensResponse = await gardenService.getGardens({
        page: 1,
        limit: 5,
      });

      // Handle the correct backend format: { HttpCode, success, data: { items: [...] } }
      let gardensData = [];
      if (
        gardensResponse &&
        gardensResponse.data &&
        gardensResponse.data.items
      ) {
        gardensData = gardensResponse.data.items;
      } else if (
        gardensResponse &&
        gardensResponse.data &&
        Array.isArray(gardensResponse.data)
      ) {
        gardensData = gardensResponse.data;
      }

      setGardens(gardensData);
      setStats((prev) => ({
        ...prev,
        totalGardens: gardensResponse.data?.total || gardensData.length,
      }));

      // Fetch vegetables with proper pagination
      const vegetablesResponse = await vegetableService.getVegetables({
        page: 1,
        limit: 5,
      });

      // Handle the correct backend format
      let vegetablesData = [];
      if (
        vegetablesResponse &&
        vegetablesResponse.data &&
        vegetablesResponse.data.items
      ) {
        vegetablesData = vegetablesResponse.data.items;
      } else if (
        vegetablesResponse &&
        vegetablesResponse.data &&
        Array.isArray(vegetablesResponse.data)
      ) {
        vegetablesData = vegetablesResponse.data;
      }

      setVegetables(vegetablesData);
      setStats((prev) => ({
        ...prev,
        totalVegetables:
          vegetablesResponse.data?.total || vegetablesData.length,
      }));

      // Skip revenue for now to avoid errors
      setStats((prev) => ({
        ...prev,
        totalRevenue: 0,
        recentSales: 0,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Lỗi khi tải dữ liệu dashboard");

      // Set empty data on error
      setGardens([]);
      setVegetables([]);
      setStats({
        totalGardens: 0,
        totalVegetables: 0,
        totalRevenue: 0,
        recentSales: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = "#4cbe00" }) => (
    <div
      style={{
        backgroundColor: "#1a2e1a",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #28392e",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          backgroundColor: color + "20",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            color: "#e0e0e0",
            fontSize: "24px",
            fontWeight: "bold",
            margin: "0 0 4px 0",
          }}
        >
          {loading ? "..." : value.toLocaleString()}
        </h3>
        <p
          style={{
            color: "#a0a0a0",
            fontSize: "14px",
            margin: 0,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            color: "#e0e0e0",
            fontSize: "28px",
            fontWeight: "bold",
            margin: "0 0 8px 0",
          }}
        >
          Chào mừng, {user?.name || "User"}! 👋
        </h1>
        <p
          style={{
            color: "#a0a0a0",
            fontSize: "16px",
            margin: 0,
          }}
        >
          Tổng quan về hệ thống quản lý vườn IoT của bạn
        </p>
      </div>

      {/* Connection Status */}
      <div
        style={{
          backgroundColor: connected ? "#10b98120" : "#dc262620",
          border: `1px solid ${connected ? "#10b981" : "#dc2626"}`,
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: connected ? "#10b981" : "#dc2626",
            borderRadius: "50%",
          }}
        ></div>
        <span
          style={{
            color: connected ? "#10b981" : "#dc2626",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {connected ? "Kết nối WebSocket thành công" : "Mất kết nối WebSocket"}
        </span>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <StatCard
          title="Tổng số vườn"
          value={stats.totalGardens}
          icon="🌱"
          color="#4cbe00"
        />
        <StatCard
          title="Loại rau củ"
          value={stats.totalVegetables}
          icon="🥬"
          color="#10b981"
        />
        <StatCard
          title="Doanh thu tổng"
          value={stats.totalRevenue}
          icon="💰"
          color="#f59e0b"
        />
        <StatCard
          title="Bán gần đây"
          value={stats.recentSales}
          icon="📈"
          color="#6366f1"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "30px",
        }}
      >
        {/* Recent Gardens */}
        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #28392e",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 20px 0",
            }}
          >
            Vườn gần đây
          </h2>

          {loading ? (
            <div
              style={{ color: "#a0a0a0", textAlign: "center", padding: "20px" }}
            >
              Đang tải...
            </div>
          ) : gardens.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {gardens.map((garden) => (
                <div
                  key={garden.id}
                  style={{
                    backgroundColor: "#28392e",
                    padding: "16px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "#e0e0e0",
                        fontSize: "16px",
                        fontWeight: "600",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {garden.name}
                    </h3>
                    <p
                      style={{
                        color: "#a0a0a0",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      Chủ sở hữu: {garden.owner?.name || "N/A"}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#4cbe00",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    Hoạt động
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                color: "#a0a0a0",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌱</div>
              <p>Chưa có vườn nào</p>
            </div>
          )}
        </div>

        {/* Recent Vegetables */}
        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #28392e",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 20px 0",
            }}
          >
            Rau củ phổ biến
          </h2>

          {loading ? (
            <div
              style={{ color: "#a0a0a0", textAlign: "center", padding: "20px" }}
            >
              Đang tải...
            </div>
          ) : vegetables.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {vegetables.map((vegetable) => (
                <div
                  key={vegetable.id}
                  style={{
                    backgroundColor: "#28392e",
                    padding: "16px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "#e0e0e0",
                        fontSize: "16px",
                        fontWeight: "600",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {vegetable.name}
                    </h3>
                    <p
                      style={{
                        color: "#a0a0a0",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      Tồn kho: {vegetable.imported - vegetable.sold}
                    </p>
                  </div>
                  <div
                    style={{
                      color: "#4cbe00",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(vegetable.price)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                color: "#a0a0a0",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🥬</div>
              <p>Chưa có rau củ nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Sensor Data */}
      {Object.keys(sensorData).length > 0 && (
        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #28392e",
            marginTop: "30px",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 20px 0",
            }}
          >
            Dữ liệu cảm biến thời gian thực
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {Object.entries(sensorData).map(([sensorId, data]) => (
              <div
                key={sensorId}
                style={{
                  backgroundColor: "#28392e",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <h4
                  style={{
                    color: "#4cbe00",
                    fontSize: "14px",
                    fontWeight: "600",
                    margin: "0 0 8px 0",
                  }}
                >
                  Cảm biến #{sensorId}
                </h4>
                <div
                  style={{
                    color: "#e0e0e0",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {data.value} {data.unit}
                </div>
                <div
                  style={{
                    color: "#a0a0a0",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {new Date(data.timestamp).toLocaleTimeString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  Yard as YardIcon,
  Grass as GrassIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { userAPI, gardenAPI, vegetableAPI } from "../../services/api";

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGardens: 0,
    totalVegetables: 0,
    totalRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentGardens, setRecentGardens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 100 };

      const [usersRes, gardensRes, vegetablesRes, revenueRes] =
        await Promise.allSettled([
          userAPI.getAll(params),
          gardenAPI.getAll(params),
          vegetableAPI.getAll(params),
          vegetableAPI.getRevenue
            ? vegetableAPI.getRevenue()
            : Promise.resolve({ data: { totalRevenue: 0 } }),
        ]);

      const userData =
        usersRes.status === "fulfilled"
          ? usersRes.value.data?.data?.items ||
            usersRes.value.data?.data ||
            usersRes.value.data ||
            []
          : [];

      const gardenData =
        gardensRes.status === "fulfilled"
          ? gardensRes.value.data?.data?.items ||
            gardensRes.value.data?.data ||
            gardensRes.value.data ||
            []
          : [];

      const vegData =
        vegetablesRes.status === "fulfilled"
          ? vegetablesRes.value.data?.data?.items ||
            vegetablesRes.value.data?.data ||
            vegetablesRes.value.data ||
            []
          : [];

      const revData =
        revenueRes.status === "fulfilled"
          ? revenueRes.value.data?.data || revenueRes.value.data || {}
          : { totalRevenue: 0 };

      const gardensWithOwners = gardenData.slice(0, 5).map((g) => {
        const owner = userData.find((u) => u.id === (g.ownerId || g.userId));
        return {
          ...g,
          ownerName: owner ? owner.name || owner.username : "N/A",
        };
      });

      setStats({
        totalUsers: userData.length,
        totalGardens: gardenData.length,
        totalVegetables: vegData.length,
        totalRevenue: revData.totalRevenue || 0,
      });

      setRecentUsers(userData.slice(0, 5));
      setRecentGardens(gardensWithOwners);
    } catch (error) {
      console.error("❌ Fatal Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#0a1929",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#00d9ff" }} />
      </Box>
    );

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#0a1929",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "white",
          }}
        >
          Xin chào, {user.username}
        </Typography>
        <Typography variant="body1" sx={{ color: "#94a3b8" }}></Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Người dùng"
            value={stats.totalUsers}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            iconBg="rgba(255, 255, 255, 0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Tổng số Vườn"
            value={stats.totalGardens}
            icon={<YardIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            iconBg="rgba(255, 255, 255, 0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Loại rau củ"
            value={stats.totalVegetables}
            icon={<GrassIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            iconBg="rgba(255, 255, 255, 0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Doanh thu"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<TrendingIcon sx={{ fontSize: 40 }} />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            iconBg="rgba(255, 255, 255, 0.2)"
          />
        </Grid>
      </Grid>

      {/* Tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#132f4c",
              border: "1px solid #1e4976",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "white",
              }}
            >
              👥 Người dùng mới
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 600,
                        border: "none",
                        pb: 2,
                      }}
                    >
                      Tên
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 600,
                        border: "none",
                        pb: 2,
                      }}
                    >
                      Vai trò
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((u) => (
                    <TableRow
                      key={u.id}
                      sx={{
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                        transition: "all 0.2s",
                      }}
                    >
                      <TableCell sx={{ py: 2, border: "none", color: "white" }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {u.name || u.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {u.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ border: "none" }}>
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{
                            bgcolor:
                              u.role === "ADMIN"
                                ? "rgba(239, 68, 68, 0.2)"
                                : "rgba(59, 130, 246, 0.2)",
                            color: u.role === "ADMIN" ? "#fca5a5" : "#93c5fd",
                            fontWeight: 600,
                            border: "none",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "#132f4c",
              border: "1px solid #1e4976",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "white",
              }}
            >
              🌿 Vườn quản lý gần đây
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#94a3b8",
                        border: "none",
                        pb: 2,
                      }}
                    >
                      Tên vườn
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#94a3b8",
                        border: "none",
                        pb: 2,
                      }}
                    >
                      Chủ sở hữu
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: "#94a3b8",
                        border: "none",
                        pb: 2,
                      }}
                    >
                      Diện tích
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentGardens.map((g) => (
                    <TableRow
                      key={g.id}
                      sx={{
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                        transition: "all 0.2s",
                      }}
                    >
                      <TableCell
                        sx={{ py: 2.5, border: "none", color: "white" }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>
                          {g.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2.5, border: "none" }}>
                        <Typography sx={{ color: "#94a3b8" }}>
                          {g.ownerName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2.5, border: "none" }}>
                        <Chip
                          label={`${g.area} m²`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(16, 185, 129, 0.2)",
                            color: "#6ee7b7",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

const StatCard = ({ label, value, icon, gradient, iconBg }) => (
  <Card
    sx={{
      background: gradient,
      color: "white",
      borderRadius: 3,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
      transition: "all 0.3s ease",
      border: "1px solid rgba(255, 255, 255, 0.18)",
      backdropFilter: "blur(4px)",
      "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              letterSpacing: "-1px",
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: iconBg,
            borderRadius: 2,
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default AdminDashboard;

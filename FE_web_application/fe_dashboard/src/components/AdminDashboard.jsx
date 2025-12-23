import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Gọi các API để lấy thống kê
      const [usersRes, gardensRes, vegetablesRes, revenueRes] =
        await Promise.all([
          userAPI.getAll({ page: 1, limit: 1 }), // Chỉ cần count
          gardenAPI.adminGetAll({ page: 1, limit: 1 }),
          vegetableAPI.getAll({ page: 1, limit: 1 }),
          vegetableAPI.getRevenue(),
        ]);

      setStats({
        totalUsers:
          usersRes.data.data?.total || usersRes.data.data?.length || 0,
        totalGardens:
          gardensRes.data.data?.total || gardensRes.data.data?.length || 0,
        totalVegetables:
          vegetablesRes.data.data?.total ||
          vegetablesRes.data.data?.length ||
          0,
        totalRevenue: revenueRes.data.data?.totalRevenue || 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user.username}! Here's your system overview.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Gardens */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <YardIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {stats.totalGardens}
                  </Typography>
                  <Typography variant="body2">Total Gardens</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Vegetables */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <GrassIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {stats.totalVegetables}
                  </Typography>
                  <Typography variant="body2">Total Vegetables</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrendingIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">System Revenue</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions or Additional Info */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Manage all users in the system
              <br />
              • Monitor all gardens and their status
              <br />
              • Track vegetables inventory across all users
              <br />• View detailed revenue reports
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default AdminDashboard;

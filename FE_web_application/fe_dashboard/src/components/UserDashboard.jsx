import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Yard as YardIcon,
  Grass as GrassIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { gardenAPI, vegetableAPI } from "../../services/api";

function UserDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myGardens: 0,
    myVegetables: 0,
    myRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Gọi API lấy gardens và vegetables của user hiện tại
      const [gardensRes, vegetablesRes, revenueRes] = await Promise.all([
        gardenAPI.getAll({ page: 1, limit: 100 }), // Lấy gardens của user
        vegetableAPI.getAll({ page: 1, limit: 100 }),
        vegetableAPI.getRevenue(), // Revenue của user
      ]);

      setStats({
        myGardens:
          gardensRes.data.data?.total || gardensRes.data.data?.length || 0,
        myVegetables:
          vegetablesRes.data.data?.total ||
          vegetablesRes.data.data?.length ||
          0,
        myRevenue: revenueRes.data.data?.totalRevenue || 0,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
            My Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user.username}! Manage your gardens here.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => navigate("/gardens")}
        >
          Add Garden
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        {/* My Gardens */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
            onClick={() => navigate("/gardens")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <YardIcon sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.myGardens}
                  </Typography>
                  <Typography variant="body1">My Gardens</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                Click to manage →
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* My Vegetables */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
            onClick={() => navigate("/vegetables")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <GrassIcon sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.myVegetables}
                  </Typography>
                  <Typography variant="body1">My Vegetables</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                Click to manage →
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* My Revenue */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
            onClick={() => navigate("/revenue")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrendingIcon sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    ${stats.myRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body1">My Revenue</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                Click to view details →
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity / Tips */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                🌱 Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/gardens")}
                >
                  View All Gardens
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/vegetables")}
                >
                  Manage Vegetables
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/revenue")}
                >
                  Check Revenue
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#f0f9ff" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                💡 Tips for Success
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Monitor your gardens regularly for optimal growth
                <br />
                • Keep track of vegetable inventory and prices
                <br />
                • Update sold quantities to calculate accurate revenue
                <br />• Check weather conditions for your garden locations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserDashboard;

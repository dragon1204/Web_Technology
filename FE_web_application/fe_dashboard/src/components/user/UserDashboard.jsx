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
    totalArea: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      console.log("📊 User Dashboard - Fetching stats for user:", user.id);
      const [gardensRes, vegetablesRes] = await Promise.all([
        gardenAPI.getAll({ page: 1, limit: 100 }),
        vegetableAPI.getAll({ page: 1, limit: 100 }),
      ]);

      const gardens = gardensRes.data?.data?.items || gardensRes.data || [];
      const vegetables =
        vegetablesRes.data?.data?.items || vegetablesRes.data || [];

      console.log(" Gardens fetched:", gardens.length);
      console.log(" Vegetables fetched:", vegetables.length);
      const totalArea = gardens.reduce(
        (sum, g) => sum + (parseFloat(g.area) || 0),
        0
      );

      setStats({
        myGardens: gardens.length,
        myVegetables: vegetables.length,
        totalArea: totalArea,
      });
    } catch (error) {
      console.error("❌ Error fetching user stats:", error);
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
          View Gardens
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* My Gardens */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              boxShadow: 3,
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 6,
              },
            }}
            onClick={() => navigate("/gardens")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <YardIcon sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.myGardens}
                  </Typography>
                  <Typography variant="body1">My Gardens</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
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
              boxShadow: 3,
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 6,
              },
            }}
            onClick={() => navigate("/vegetables")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <GrassIcon sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.myVegetables}
                  </Typography>
                  <Typography variant="body1">My Vegetables</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Click to manage →
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Area */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s",
              boxShadow: 3,
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 6,
              },
            }}
            onClick={() => navigate("/revenue")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingIcon sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.totalArea.toFixed(1)}
                  </Typography>
                  <Typography variant="body1">Total Area (m²)</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Click to view details →
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions / Tips */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
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
          <Card sx={{ bgcolor: "#f0f9ff", boxShadow: 3 }}>
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

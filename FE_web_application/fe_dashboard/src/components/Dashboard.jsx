import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Yard as YardIcon,
  Grass as GrassIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { userAPI, gardenAPI, vegetableAPI } from "../services/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function StatCard({ title, value, icon, color }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: "50%",
              p: 2,
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
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    gardens: 0,
    vegetables: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState({
    vegetables: [],
    gardens: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, gardensRes, vegetablesRes, revenueTotalRes] =
        await Promise.all([
          userAPI.getAll(),
          gardenAPI.getAll(),
          vegetableAPI.getAll(),
          vegetableAPI.getRevenueTotal({ type: "month" }), // type is required: day, week, or month
        ]);
      console.log("Revenue total response:", revenueTotalRes.data);

      // Handle pagination response structure: 
      // Axios response: response.data = { HttpCode, success, data: { items: [...], total, page, ... } }
      // So we need: response.data.data.items
      const usersData = usersRes.data?.data?.items || usersRes.data?.items || usersRes.data?.data || usersRes.data || [];
      const gardensData = gardensRes.data?.data?.items || gardensRes.data?.items || gardensRes.data?.data || gardensRes.data || [];
      const vegetablesData = vegetablesRes.data?.data?.items || vegetablesRes.data?.items || vegetablesRes.data?.data || vegetablesRes.data || [];

      setStats({
        users: Array.isArray(usersData) ? usersData.length : 0,
        gardens: Array.isArray(gardensData) ? gardensData.length : 0,
        vegetables: Array.isArray(vegetablesData) ? vegetablesData.length : 0,
        revenue: Number(revenueTotalRes.data?.totalRevenue || revenueTotalRes.data?.data?.totalRevenue) || 0,
      });

      const vegData = (Array.isArray(vegetablesData) ? vegetablesData : []).slice(0, 5).map((v) => {
        // Calculate quantity from imported and sold (inventory = imported - sold)
        const quantity = v.quantity ?? (v.imported ?? 0) - (v.sold ?? 0);
        return {
        name: v.name || "Unknown",
          quantity: quantity,
        price: v.price || 0,
        };
      });

      const gardenData = (Array.isArray(gardensData) ? gardensData : []).slice(0, 5).map((g) => ({
        name: g.name || "Garden",
        area: g.area || 0,
      }));

      setChartData({
        vegetables: vegData,
        gardens: gardenData,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setStats({
        users: 0,
        gardens: 0,
        vegetables: 0,
        revenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={<PeopleIcon sx={{ color: "white" }} />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Gardens"
            value={stats.gardens}
            icon={<YardIcon sx={{ color: "white" }} />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vegetables"
            value={stats.vegetables}
            icon={<GrassIcon sx={{ color: "white" }} />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue.toFixed(2)}`}
            icon={<MoneyIcon sx={{ color: "white" }} />}
            color="#F44336"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Vegetable Quantity Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vegetable Inventory
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.vegetables}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Vegetable Price Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vegetable Prices
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.vegetables}
                    dataKey="price"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.vegetables.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Garden Area Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Garden Areas (m²)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.gardens}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="area" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;

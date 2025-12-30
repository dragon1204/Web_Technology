import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { vegetableAPI } from "../../services/api";

function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    byVegetable: [],
  });
  const [vegetables, setVegetables] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [revenueTotalRes, revenueListRes, vegetablesRes] = await Promise.all([
        vegetableAPI.getRevenueTotal({ type: "month" }), // type is required: day, week, or month
        vegetableAPI.getRevenueList({ type: "month" }), // type is required: day, week, or month
        vegetableAPI.getAll(),
      ]);

      // Handle response structure with pagination: 
      // Axios response: response.data = { HttpCode, success, data: { items: [...], total, page, ... } }
      // So we need: response.data.data.items
      const totalRevenue = revenueTotalRes.data?.data?.totalRevenue || revenueTotalRes.data?.totalRevenue || 0;
      const listRaw = revenueListRes.data?.data?.items || revenueListRes.data?.items || revenueListRes.data?.data || revenueListRes.data || [];
      const vegetablesData = vegetablesRes.data?.data?.items || vegetablesRes.data?.items || vegetablesRes.data?.data || vegetablesRes.data || [];

      setRevenueData({
        total: totalRevenue,
        byVegetable: Array.isArray(listRaw) ? listRaw : [],
      });

      const vegWithRevenue = (Array.isArray(vegetablesData) ? vegetablesData : []).map((v) => {
        // Calculate quantity from imported and sold (inventory = imported - sold)
        const quantity = v.quantity ?? (v.imported ?? 0) - (v.sold ?? 0);
        return {
          name: v.name,
          revenue: (v.price || 0) * quantity,
          quantity: quantity,
          price: v.price || 0,
        };
      });

      setVegetables(vegWithRevenue);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Revenue Analytics
      </Typography>

      {/* Total Revenue Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    Total Revenue
                  </Typography>
                  <Typography variant="h3" color="primary">
                    ${revenueData.total.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#4CAF50",
                    borderRadius: "50%",
                    p: 2,
                    display: "flex",
                  }}
                >
                  <MoneyIcon sx={{ color: "white", fontSize: 40 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    Total Products
                  </Typography>
                  <Typography variant="h3" color="secondary">
                    {vegetables.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#2196F3",
                    borderRadius: "50%",
                    p: 2,
                    display: "flex",
                  }}
                >
                  <TrendingUpIcon sx={{ color: "white", fontSize: 40 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Vegetable
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData.byVegetable.length ? revenueData.byVegetable : vegetables}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stock Levels
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vegetables}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke="#82ca9d"
                    name="Quantity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Revenue Breakdown
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vegetable</TableCell>
                  <TableCell align="right">Price ($)</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Revenue ($)</TableCell>
                  <TableCell align="right">% of Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(revenueData.byVegetable.length ? revenueData.byVegetable : vegetables).map((veg) => (
                  <TableRow key={veg.name}>
                    <TableCell>{veg.name}</TableCell>
                    <TableCell align="right">${Number(veg.price ?? 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{veg.quantity ?? 0}</TableCell>
                    <TableCell align="right">
                      ${Number(veg.revenue ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {revenueData.total > 0
                        ? (((veg.revenue ?? 0) / revenueData.total) * 100).toFixed(1)
                        : 0}
                      %
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3}>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>${revenueData.total.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>100%</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default RevenuePage;

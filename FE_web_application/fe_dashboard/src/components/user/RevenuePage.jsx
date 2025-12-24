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
      const [revenueRes, vegetablesRes] = await Promise.all([
        vegetableAPI.getRevenue(),
        vegetableAPI.getAll(),
      ]);

      setRevenueData({
        total: revenueRes.data.totalRevenue || 0,
        byVegetable: revenueRes.data.byVegetable || [],
      });

      const vegWithRevenue = vegetablesRes.data.map((v) => ({
        name: v.name,
        revenue: (v.price || 0) * (v.quantity || 0),
        quantity: v.quantity || 0,
        price: v.price || 0,
      }));

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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Vegetable
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vegetables}>
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
                {vegetables.map((veg) => (
                  <TableRow key={veg.name}>
                    <TableCell>{veg.name}</TableCell>
                    <TableCell align="right">${veg.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{veg.quantity}</TableCell>
                    <TableCell align="right">
                      ${veg.revenue.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {revenueData.total > 0
                        ? ((veg.revenue / revenueData.total) * 100).toFixed(1)
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

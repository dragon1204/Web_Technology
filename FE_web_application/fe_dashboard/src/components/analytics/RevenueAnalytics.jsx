import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAnalytics } from "../../hooks/useAnalytics";

const RevenueAnalytics = () => {
  const { loading, error, getRevenuePeriod, compareGardens, getTopProducts } =
    useAnalytics();

  const [revenueData, setRevenueData] = useState([]);
  const [gardenComparison, setGardenComparison] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    loadRevenueData();
    loadGardenComparison();
    loadTopProducts();
  }, [period, startDate, endDate]);

  const loadRevenueData = async () => {
    try {
      const data = await getRevenuePeriod({
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setRevenueData(data);
    } catch (error) {
      console.error("Error loading revenue data:", error);
    }
  };

  const loadGardenComparison = async () => {
    try {
      const data = await compareGardens({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setGardenComparison(data);
    } catch (error) {
      console.error("Error loading garden comparison:", error);
    }
  };

  const loadTopProducts = async () => {
    try {
      const data = await getTopProducts({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 10,
      });
      setTopProducts(data);
    } catch (error) {
      console.error("Error loading top products:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Revenue Analytics
      </Typography>

      {/* Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              label="Period"
            >
              <MenuItem value="day">Daily</MenuItem>
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="year">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Revenue Trend Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Revenue Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Garden Comparison */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Garden Revenue Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gardenComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gardenName" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Selling Products
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="productName" type="category" width={100} />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Legend />
              <Bar dataKey="revenue" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RevenueAnalytics;

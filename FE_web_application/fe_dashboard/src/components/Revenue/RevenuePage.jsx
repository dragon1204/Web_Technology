import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
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
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { vegetableAPI, analyticsAPI } from "../../services/api";

function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    byVegetable: [],
  });
  const [vegetables, setVegetables] = useState([]);
  const [periodSeries, setPeriodSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [gardenComparison, setGardenComparison] = useState([]);
  const [error, setError] = useState("");

  // Filters
  const [timeGranularity, setTimeGranularity] = useState("month"); // day | week | month
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async () => {
    setError("");
    setRefreshing(true);
    try {
      // Analytics API expect 'period' not 'type'
      const analyticsParams = {
        period: timeGranularity,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      };

      // Vegetable API params (if endpoints exist)
      const vegetableParams = {
        type: timeGranularity,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      };

      // Fetch data từ orders đã thanh toán (PAID) của shop owner
      const [
        vegetablesRes,
        revenuePeriodRes,
        topProductsRes,
        gardenCompareRes,
      ] = await Promise.all([
        // Lấy danh sách vegetables (để hiển thị trong table)
        vegetableAPI.getAll({ limit: 500 }).catch(() => ({ data: { data: { items: [] } } })),
        // Doanh thu từ orders đã thanh toán theo thời gian
        analyticsAPI.getShopOwnerRevenueByPeriod({
          period: timeGranularity,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        }).catch((err) => {
          console.warn("Analytics shop-owner revenue/period error:", err);
          return { data: { data: [] } };
        }),
        // Top sản phẩm từ orders đã thanh toán
        analyticsAPI.getTopProducts({
          limit: 10,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        }).catch((err) => {
          console.warn("Analytics top-products error:", err);
          return { data: { data: [] } };
        }),
        // So sánh doanh thu giữa các vườn từ orders đã thanh toán
        analyticsAPI.compareGardenRevenueByShopOrders({
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        }).catch((err) => {
          console.warn("Analytics compare-gardens-shop error:", err);
          return { data: { data: [] } };
        }),
      ]);

      // Lấy danh sách vegetables để hiển thị (không tính revenue từ đây nữa)
      const vegetablesData = vegetablesRes.data?.data?.items || vegetablesRes.data?.items || vegetablesRes.data?.data || vegetablesRes.data || [];
      const vegList = (Array.isArray(vegetablesData) ? vegetablesData : []).map((v) => {
        const quantity = v.quantity ?? (v.imported ?? 0) - (v.sold ?? 0);
        return {
          name: v.name,
          revenue: 0, // Sẽ được tính từ orders
          quantity: quantity,
          price: v.price || 0,
        };
      });
      setVegetables(vegList);

      // --- Revenue by period (line chart) từ orders đã thanh toán ---
      const periodRaw =
        revenuePeriodRes.data?.data ||
        revenuePeriodRes.data ||
        [];
      const periodArray = Array.isArray(periodRaw) ? periodRaw : [];
      const mappedPeriod = periodArray.map((p, idx) => {
        const revenue = Number(p.totalRevenue || p.revenue || p.total || 0);
        const orders = Number(p.orderCount || p.orders || p.saleCount || 0);
        const periodDate = p.period ? new Date(p.period) : new Date();
        
        // Format label theo period
        let label = '';
        if (timeGranularity === 'day') {
          label = periodDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        } else if (timeGranularity === 'week') {
          const weekStart = new Date(periodDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          label = `Tuần ${weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
        } else if (timeGranularity === 'month') {
          label = periodDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
        } else {
          label = periodDate.toLocaleDateString('vi-VN', { year: 'numeric' });
        }

        return {
          id: idx,
          label,
          revenue: Math.round(revenue),
          orders: Math.round(orders),
        };
      });
      setPeriodSeries(mappedPeriod);

      // Tính tổng revenue từ orders đã thanh toán
      const totalRevenue = mappedPeriod.reduce((sum, p) => sum + (p.revenue || 0), 0);

      // --- Top products (bar chart) từ orders đã thanh toán ---
      const topRaw =
        topProductsRes.data?.data ||
        topProductsRes.data ||
        [];
      const topArray = Array.isArray(topRaw) ? topRaw : [];
      const mappedTop = topArray.map((t, idx) => ({
        id: t.vegetableId || t.id || idx,
        name: t.vegetableName || t.name || t.productName || `Sản phẩm #${idx + 1}`,
        revenue: Math.round(Number(t.totalRevenue || t.revenue || t.total || 0)),
        orders: Math.round(Number(t.orderCount || t.orders || t.saleCount || 0)),
      }));
      setTopProducts(mappedTop);

      // Cập nhật revenue cho vegetables từ top products
      const vegWithRevenue = vegList.map((v) => {
        const topProduct = mappedTop.find((tp) => tp.name === v.name);
        return {
          ...v,
          revenue: topProduct ? topProduct.revenue : 0,
        };
      });

      setRevenueData({
        total: totalRevenue,
        byVegetable: vegWithRevenue,
      });

      // --- Garden comparison (bar chart) từ orders đã thanh toán ---
      const gardenRaw =
        gardenCompareRes.data?.data ||
        gardenCompareRes.data ||
        [];
      const gardenArray = Array.isArray(gardenRaw) ? gardenRaw : [];
      const mappedGarden = gardenArray.map((g, idx) => ({
        id: g.gardenId || g.id || idx,
        name: g.gardenName || g.name || `Vườn #${idx + 1}`,
        revenue: Math.round(Number(g.totalRevenue || g.revenue || g.total || 0)),
      }));
      setGardenComparison(mappedGarden);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError(error?.message || "Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeGranularity, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRevenueDisplay = (revenueData.total || 0).toLocaleString("vi-VN");

  const averagePerPeriod = (() => {
    if (!periodSeries.length) return 0;
    const sum = periodSeries.reduce((acc, p) => acc + (p.revenue || 0), 0);
    return Math.round(sum / periodSeries.length);
  })();

  const totalOrders = periodSeries.reduce((acc, p) => acc + (p.orders || 0), 0);

  const mainTableData =
    revenueData.byVegetable.length ? revenueData.byVegetable : vegetables;

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
      {/* Header + filters */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1, color: "#ffffff", fontWeight: 700 }}>
            Báo cáo doanh thu
          </Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
            Tổng hợp doanh thu, sản phẩm và hiệu quả theo vườn theo từng khoảng thời gian.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            select
            size="small"
            label="Chu kỳ"
            value={timeGranularity}
            onChange={(e) => setTimeGranularity(e.target.value)}
          >
            <MenuItem value="day">Theo ngày</MenuItem>
            <MenuItem value="week">Theo tuần</MenuItem>
            <MenuItem value="month">Theo tháng</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Từ ngày"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            size="small"
            label="Đến ngày"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {refreshing && (
            <CircularProgress size={22} />
          )}
        </Stack>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #fecaca",
              backgroundColor: "#fef2f2",
            }}
          >
            <Typography variant="body2" sx={{ color: "#b91c1c" }}>
              {typeof error === "string"
                ? error
                : error?.message || "Đã xảy ra lỗi khi tải dữ liệu doanh thu"}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 14px 30px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    TỔNG DOANH THU
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "#15803d", mt: 1 }}
                  >
                    {totalRevenueDisplay} VNĐ
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background:
                      "radial-gradient(circle at 30% 30%, #bbf7d0 0, #22c55e 35%, #14532d 100%)",
                    borderRadius: "18px",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MoneyIcon sx={{ color: "white", fontSize: 34 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    DOANH THU TRUNG BÌNH / {timeGranularity === "day" ? "ngày" : timeGranularity === "week" ? "tuần" : "tháng"}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                    {periodSeries.length > 0
                      ? `${averagePerPeriod.toLocaleString("vi-VN")} VNĐ`
                      : "—"}
                  </Typography>
                </Box>
                {periodSeries.length > 0 && (
                  <Chip
                    label={`${periodSeries.length} khoảng`}
                    size="small"
                    sx={{ fontWeight: 600, bgcolor: "#ecfdf3", color: "#166534" }}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    SẢN PHẨM & ĐƠN HÀNG
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="baseline">
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {vegetables.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      loại rau
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {totalOrders > 0
                      ? `${totalOrders.toLocaleString("vi-VN")} đơn hàng`
                      : "Chưa có số liệu đơn hàng"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#eff6ff",
                    borderRadius: "18px",
                    p: 1.5,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 30, color: "#1d4ed8" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="h6">Doanh thu theo thời gian</Typography>
                <Chip
                  label={timeGranularity === "day" ? "Theo ngày" : timeGranularity === "week" ? "Theo tuần" : "Theo tháng"}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={periodSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip
                    formatter={(value, name) =>
                      name === "revenue"
                        ? [`${Number(value || 0).toLocaleString("vi-VN")} VNĐ`, "Doanh thu"]
                        : [value, "Đơn hàng"]
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    name="Doanh thu"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#0ea5e9"
                    name="Số đơn"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              minHeight: 380,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="h6">Top sản phẩm theo doanh thu</Typography>
                <Chip
                  label={`${topProducts.length} sản phẩm`}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    formatter={(value, name) =>
                      name === "revenue"
                        ? [`${Number(value || 0).toLocaleString("vi-VN")} VNĐ`, "Doanh thu"]
                        : [value, "Đơn hàng"]
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22c55e" name="Doanh thu" />
                  <Bar dataKey="orders" fill="#0ea5e9" name="Số đơn" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Garden comparison + stock levels */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              minHeight: 360,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                So sánh doanh thu giữa các vườn
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={gardenComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    formatter={(value) => [
                      `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`,
                      "Doanh thu",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4f46e5" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              minHeight: 360,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Tồn kho theo sản phẩm
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={vegetables}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke="#22c55e"
                    name="Số lượng"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Bảng chi tiết doanh thu theo sản phẩm
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Thống kê giá bán, số lượng và doanh thu, kèm tỷ trọng trên tổng doanh thu.
              </Typography>
            </Box>
            <Tooltip title="Dữ liệu lấy từ API /vegetable & /vegetable/revenue/*">
              <IconButton size="small">
                <MoneyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="right">Giá (VNĐ)</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell align="right">Doanh thu (VNĐ)</TableCell>
                  <TableCell align="right">% trên tổng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mainTableData.map((veg) => {
                  const revenue = Number(veg.revenue ?? (veg.price || 0) * (veg.quantity || 0));
                  const percent =
                    revenueData.total > 0 ? (revenue / revenueData.total) * 100 : 0;

                  return (
                    <TableRow key={veg.name}>
                      <TableCell>{veg.name}</TableCell>
                      <TableCell align="right">
                        {(Number(veg.price ?? 0) || 0).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell align="right">{veg.quantity ?? 0}</TableCell>
                      <TableCell align="right">
                        {revenue.toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell align="right">
                        {percent.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={3}>
                    <strong>Tổng cộng</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{totalRevenueDisplay} VNĐ</strong>
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

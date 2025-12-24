import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LocationOn, Straighten } from "@mui/icons-material";
import { gardenAPI } from "../../services/api";

function MyGardenList() {
  const [gardens, setGardens] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGardens();
  }, []);

  const fetchMyGardens = async () => {
    try {
      setLoading(true);
      // KHÔNG gửi userId lên URL, Backend tự lọc qua Token
      const response = await gardenAPI.getAll({ page: 1, limit: 100 });

      // Xử lý dữ liệu linh hoạt (cho cả dạng mảng và dạng phân trang)
      const resData = response.data?.data || response.data;
      const items = resData?.items || (Array.isArray(resData) ? resData : []);

      setGardens(items);
    } catch (err) {
      console.error("Lỗi tải vườn:", err);
      setError(
        "Không thể tải danh sách vườn. Vui lòng kiểm tra lại quyền truy cập."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Vườn của tôi
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {gardens.map((garden) => (
          <Grid item xs={12} sm={6} md={4} key={garden.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  color="primary"
                  gutterBottom
                  fontWeight="bold"
                >
                  {garden.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationOn
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    {garden.location || "Chưa xác định"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Straighten
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2">{garden.area || 0} m²</Typography>
                </Box>
              </CardContent>
              <CardActions
                sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
              >
                <Button size="small" variant="outlined">
                  Quản lý rau
                </Button>
                <Button size="small" variant="contained" color="success">
                  Xem IoT
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {gardens.length === 0 && !error && (
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Bạn chưa có vườn nào trong hệ thống.
        </Typography>
      )}
    </Box>
  );
}

export default MyGardenList;

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tab,
  Tabs,
  TextField,
  Button,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
  MenuItem,
  Container,
  InputAdornment,
  Avatar,
  Divider,
} from "@mui/material";
import {
  History as HistoryIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { auditService } from "../services/auditService";
import { useAuth } from "../contexts/AuthContext";

const AuditLogs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.data?.role === "ADMIN";

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // UI tab index (0-based) - luôn là 0..N-1 để Tabs không cảnh báo
  const [activeTab, setActiveTab] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    entityId: "",
    success: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const [statistics, setStatistics] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
    if (isAdmin && activeTab === 0) {
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pagination.page, isAdmin]);

  const fetchStatistics = async () => {
    try {
      const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
      const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
      const stats = await auditService.getStatistics({ startDate, endDate });
      setStatistics(stats);
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        success: filters.success === "" ? undefined : filters.success === "true",
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.search || undefined,
      };

      // Remove undefined values
      Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);

      if (isAdmin) {
        if (activeTab === 0) {
          // Recent logs (Admin only)
          response = await auditService.getRecentLogs(params);
        } else if (activeTab === 1) {
          // My logs
          response = await auditService.getMyLogs(params);
        } else if (activeTab === 2) {
          // Search with filters
          response = await auditService.searchLogs(params);
        }
      } else {
        // USER/CUSTOMER chỉ có tab \"My Activity\" (index 0)
        response = await auditService.getMyLogs(params);
      }

      // Chuẩn hoá cấu trúc response từ backend:
      // Backend trả về: { data: [...], pagination: { page, limit, total, totalPages } }
      // Hoặc: { HttpCode, success, data: { data: [...], pagination: {...} } }
      const responseData = response?.data || response;
      const core = responseData?.data || responseData;
      
      const logsArray =
        (Array.isArray(core)
          ? core
          : Array.isArray(core?.data)
          ? core.data
          : Array.isArray(core?.items)
          ? core.items
          : []) || [];

      setLogs(Array.isArray(logsArray) ? logsArray : []);

      // Lấy pagination info từ response
      // Backend trả về: { data: [...], pagination: { page, limit, total, totalPages } }
      const paginationInfo = responseData?.pagination || core?.pagination || {};
      const total = paginationInfo.total ?? responseData?.total ?? core?.total ?? logsArray.length ?? 0;
      const calculatedTotalPages = total && pagination.limit ? Math.ceil(total / pagination.limit) : 1;
      const totalPages = paginationInfo.totalPages ?? responseData?.totalPages ?? core?.totalPages ?? calculatedTotalPages;
      
      console.log("AuditLogs: Pagination info from backend:", {
        total,
        totalPages,
        calculatedTotalPages,
        paginationInfo,
        responseData,
        core,
        currentPage: pagination.page,
        limit: pagination.limit
      });

      setPagination(prev => ({
        ...prev,
        total: Number(total) || 0,
        totalPages: Number(totalPages) || 1,
      }));
    } catch (err) {
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getActionColor = (action) => {
    const colorMap = {
      CREATE: "#4caf50",
      UPDATE: "#ff9800",
      DELETE: "#f44336",
      LOGIN: "#2196f3",
      LOGOUT: "#9e9e9e",
      REGISTER: "#9c27b0",
      READ: "#607d8b",
    };
    return colorMap[action] || "#9e9e9e";
  };

  const handleReset = () => {
    setFilters({
      action: "",
      entityType: "",
      entityId: "",
      success: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleApplyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchLogs();
    if (activeTab === 0 && isAdmin) {
      fetchStatistics();
    }
  };

  const renderStatistics = () => {
    if (!statistics || !isAdmin || activeTab !== 0) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Logs Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Logs
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.total || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <HistoryIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Success Rate Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Success
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.bySuccess?.success || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Failed Logs Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f44336 0%, #c62828 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(244, 67, 54, 0.3)",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Failed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.bySuccess?.failed || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <ErrorIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(255, 152, 0, 0.3)",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Action Types
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.byAction?.length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <BarChartIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Breakdown */}
        {statistics.byAction && statistics.byAction.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1a3a3a" }}>
                  Actions Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {statistics.byAction.map((item) => (
                    <Grid item xs={6} sm={4} md={2} key={item.action}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: "center",
                          backgroundColor: `${getActionColor(item.action)}15`,
                          borderLeft: `4px solid ${getActionColor(item.action)}`,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#666", mb: 0.5 }}>
                          {item.action}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: getActionColor(item.action) }}>
                          {item.count}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a3a3a 0%, #2d5a5a 100%)",
          borderRadius: 3,
          p: 3,
          mb: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(76,190,0,0.15) 0%, transparent 70%)",
          }}
        />
        <Stack direction="row" alignItems="center" spacing={2} sx={{ position: "relative" }}>
          <Avatar sx={{ bgcolor: "rgba(76,190,0,0.2)", width: 64, height: 64 }}>
            {isAdmin ? <SecurityIcon sx={{ fontSize: 36, color: "#4cbe00" }} /> : <PersonIcon sx={{ fontSize: 36, color: "#4cbe00" }} />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", mb: 0.5 }}>
              Audit Logs
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              {isAdmin ? "Monitor all system activities and user actions" : "View your activity history"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {isAdmin && (
              <Chip
                icon={<AdminIcon />}
                label="Admin View"
                sx={{
                  bgcolor: "rgba(255,215,0,0.2)",
                  color: "#ffd700",
                  fontWeight: 600,
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              />
            )}
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => {
                  fetchLogs();
                  if (activeTab === 0 && isAdmin) fetchStatistics();
                }}
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Statistics Dashboard (Admin Only) */}
      {renderStatistics()}

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPagination({ ...pagination, page: 1 });
            setFilters({
              action: "",
              entityType: "",
              entityId: "",
              success: "",
              startDate: "",
              endDate: "",
              search: "",
            });
          }}
          sx={{
            "& .MuiTabs-indicator": {
              height: 3,
              backgroundColor: "#4cbe00",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              minHeight: 60,
              "&:hover": {
                backgroundColor: "rgba(76,190,0,0.05)",
              },
              "&.Mui-selected": {
                color: "#4cbe00",
              },
            },
          }}
        >
          {isAdmin && <Tab label="Recent Activity" icon={<TimelineIcon />} iconPosition="start" />}
          <Tab label="My Activity" icon={<HistoryIcon />} iconPosition="start" />
          {isAdmin && <Tab label="Advanced Search" icon={<SearchIcon />} iconPosition="start" />}
        </Tabs>
      </Paper>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <FilterIcon sx={{ color: "#4cbe00" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a3a3a" }}>
              Filters
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {/* Search Box (for Advanced Search tab) */}
            {activeTab === 2 && isAdmin && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Search in action, entity type, entity ID, IP address, error message..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4cbe00",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4cbe00",
                      },
                    },
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Action"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                size="small"
                fullWidth
              >
                <MenuItem value="">All Actions</MenuItem>
                <MenuItem value="LOGIN">Login</MenuItem>
                <MenuItem value="LOGOUT">Logout</MenuItem>
                <MenuItem value="REGISTER">Register</MenuItem>
                <MenuItem value="CREATE">Create</MenuItem>
                <MenuItem value="UPDATE">Update</MenuItem>
                <MenuItem value="DELETE">Delete</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Status"
                value={filters.success}
                onChange={(e) => setFilters({ ...filters, success: e.target.value })}
                size="small"
                fullWidth
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Success</MenuItem>
                <MenuItem value="false">Failed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ fontSize: 20, color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ fontSize: 20, color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {activeTab === 2 && isAdmin && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Entity Type"
                    placeholder="User, Garden, Shop..."
                    value={filters.entityType}
                    onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Entity ID"
                    placeholder="Enter ID"
                    value={filters.entityId}
                    onChange={(e) => setFilters({ ...filters, entityId: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={activeTab === 2 && isAdmin ? 6 : 12}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={handleApplyFilters}
                  fullWidth
                  sx={{
                    bgcolor: "#4cbe00",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#3da000",
                    },
                  }}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={handleReset}
                  fullWidth
                  sx={{
                    borderColor: "#ddd",
                    color: "#666",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#999",
                      bgcolor: "#f5f5f5",
                    },
                  }}
                >
                  Clear All
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 8, gap: 2 }}>
            <CircularProgress size={48} sx={{ color: "#4cbe00" }} />
            <Typography color="textSecondary">Loading audit logs...</Typography>
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#102216", color: "#fff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" }}>
                  Timestamp
                </TableCell>
                {isAdmin && activeTab !== 1 && (
                  <TableCell sx={{ bgcolor: "#102216", color: "#fff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" }}>
                    User
                  </TableCell>
                )}
                <TableCell sx={{ bgcolor: "#102216", color: "#fff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" }}>
                  Action
                </TableCell>
                <TableCell sx={{ bgcolor: "#102216", color: "#fff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" }}>
                  Entity
                </TableCell>
                <TableCell sx={{ bgcolor: "#102216", color: "#fff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" }}>
                  IP Address
                </TableCell>
                <TableCell align="center" sx={{ bgcolor: "#102216", color: "#fff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ bgcolor: "#102216", color: "#fff", fontWeight: 700, fontSize: "13px", textTransform: "uppercase" }}>
                  Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow
                    key={log.id || index}
                    sx={{
                      bgcolor: index % 2 === 0 ? "#f7f9f7" : "#fff",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#eef7ef",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(76,190,0,0.1)",
                      },
                    }}
                  >
                    <TableCell sx={{ fontSize: "13px", fontFamily: "monospace", color: "#102216" }}>
                      {formatDate(log.timestamp || log.createdAt)}
                    </TableCell>
                    {isAdmin && activeTab !== 1 && (
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#4cbe00", fontSize: "14px" }}>
                            {(log.user?.name || log.user?.email || "U").charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#102216", fontSize: "13px" }}>
                              {log.user?.name || log.user?.email || `User #${log.userId}`}
                            </Typography>
                            {log.user?.role && (
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                {log.user.role}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        sx={{
                          bgcolor: getActionColor(log.action),
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "11px",
                          letterSpacing: "0.5px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {log.entityType ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#102216", fontSize: "13px" }}>
                            {log.entityType}
                          </Typography>
                          {log.entityId && (
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              ID: {log.entityId}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography sx={{ color: "#999" }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px", fontFamily: "monospace", color: "#666" }}>
                      {log.ipAddress || "-"}
                    </TableCell>
                    <TableCell align="center">
                      {log.success !== undefined ? (
                        log.success ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Success"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Tooltip title={log.errorMessage || "Failed"}>
                            <Chip
                              icon={<ErrorIcon />}
                              label="Failed"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 600 }}
                            />
                          </Tooltip>
                        )
                      ) : (
                        <Typography sx={{ color: "#999" }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {log.changes || log.details || log.metadata ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailsOpen(true);
                          }}
                          sx={{
                            textTransform: "none",
                            borderColor: "#4cbe00",
                            color: "#4cbe00",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: "#3da000",
                              bgcolor: "rgba(76,190,0,0.05)",
                            },
                          }}
                        >
                          View
                        </Button>
                      ) : (
                        <Typography sx={{ color: "#999" }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin && activeTab !== 1 ? 7 : 6} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={2}>
                      <HistoryIcon sx={{ fontSize: 64, color: "#ccc" }} />
                      <Typography variant="h6" sx={{ color: "#666" }}>
                        No Audit Logs Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#999" }}>
                        Try adjusting your filters or date range
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Pagination */}
      {logs.length > 0 && (
        <Card sx={{ mt: 3, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                  Total: <strong style={{ color: "#4cbe00" }}>{pagination.total}</strong> logs
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" sx={{ color: "#999" }}>
                  Page {pagination.page} of {pagination.totalPages}
                </Typography>
              </Stack>
              <Pagination
                count={pagination.totalPages || 1}
                page={pagination.page || 1}
                onChange={(e, newPage) => {
                  console.log("Pagination onChange:", { oldPage: pagination.page, newPage, totalPages: pagination.totalPages });
                  setPagination(prev => ({ ...prev, page: newPage }));
                }}
                color="primary"
                disabled={loading || !pagination.totalPages || pagination.totalPages <= 1}
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    "&.Mui-selected": {
                      bgcolor: "#4cbe00",
                      color: "white",
                      "&:hover": {
                        bgcolor: "#3da000",
                      },
                    },
                    "&.Mui-disabled": {
                      opacity: 0.4,
                      cursor: "not-allowed",
                    },
                    "&:not(.Mui-disabled)": {
                      "&:hover": {
                        bgcolor: "rgba(76,190,0,0.1)",
                      },
                    },
                  },
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1a3a3a 0%, #2d5a5a 100%)",
            color: "white",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <InfoIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Audit Log Details
            </Typography>
          </Stack>
          <IconButton
            onClick={() => setDetailsOpen(false)}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedLog && (
            <Stack spacing={2.5}>
              <Box sx={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                  Action:
                </Typography>
                <Chip
                  label={selectedLog.action}
                  size="small"
                  sx={{
                    bgcolor: getActionColor(selectedLog.action),
                    color: "#fff",
                    fontWeight: 600,
                    width: "fit-content",
                  }}
                />

                <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                  Timestamp:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#333" }}>
                  {formatDate(selectedLog.timestamp || selectedLog.createdAt)}
                </Typography>

                {isAdmin && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                      User:
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 28, height: 28, bgcolor: "#4cbe00", fontSize: "12px" }}>
                        {(selectedLog.user?.name || selectedLog.user?.email || "U").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedLog.user?.name || selectedLog.user?.email || `User #${selectedLog.userId}`}
                        </Typography>
                        {selectedLog.user?.role && (
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {selectedLog.user.role}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </>
                )}

                {selectedLog.entityType && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                      Entity:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#333" }}>
                      {selectedLog.entityType}
                      {selectedLog.entityId && ` #${selectedLog.entityId}`}
                    </Typography>
                  </>
                )}

                {selectedLog.ipAddress && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                      IP Address:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#333" }}>
                      {selectedLog.ipAddress}
                    </Typography>
                  </>
                )}

                {selectedLog.userAgent && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                      User Agent:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "12px", color: "#666", wordBreak: "break-word" }}>
                      {selectedLog.userAgent}
                    </Typography>
                  </>
                )}

                {selectedLog.requestId && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                      Request ID:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#333" }}>
                      {selectedLog.requestId}
                    </Typography>
                  </>
                )}

                <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                  Status:
                </Typography>
                {selectedLog.success !== undefined ? (
                  selectedLog.success ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Success"
                      size="small"
                      color="success"
                      sx={{ width: "fit-content", fontWeight: 600 }}
                    />
                  ) : (
                    <Stack spacing={1}>
                      <Chip
                        icon={<ErrorIcon />}
                        label="Failed"
                        size="small"
                        color="error"
                        sx={{ width: "fit-content", fontWeight: 600 }}
                      />
                      {selectedLog.errorMessage && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {selectedLog.errorMessage}
                        </Alert>
                      )}
                    </Stack>
                  )
                ) : (
                  <Typography sx={{ color: "#999" }}>-</Typography>
                )}
              </Box>

              {(selectedLog.changes || selectedLog.details || selectedLog.metadata) && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#666", mb: 1 }}>
                    Changes/Details:
                  </Typography>
                  <Paper
                    sx={{
                      bgcolor: "#1e1e1e",
                      p: 2,
                      borderRadius: 1,
                      overflow: "auto",
                      maxHeight: "400px",
                      border: "1px solid #333",
                    }}
                  >
                    <Typography
                      component="pre"
                      variant="body2"
                      sx={{
                        fontSize: "12px",
                        whiteSpace: "pre-wrap",
                        color: "#d4d4d4",
                        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                        margin: 0,
                      }}
                    >
                      {JSON.stringify(
                        selectedLog.changes || selectedLog.details || selectedLog.metadata,
                        null,
                        2
                      )}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDetailsOpen(false)}
            variant="contained"
            sx={{
              bgcolor: "#4cbe00",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                bgcolor: "#3da000",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AuditLogs;

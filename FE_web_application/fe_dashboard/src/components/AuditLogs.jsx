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
} from "@mui/material";
import {
  History as HistoryIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { auditService } from "../services/auditService";
import { useAuth } from "../contexts/AuthContext";

const AuditLogs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.data?.role === "ADMIN";

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isAdmin ? "recent" : "my");
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
    startDate: "",
    endDate: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [activeTab, pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.action) params.action = filters.action;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      if (activeTab === "entity") {
        if (filters.entityType) params.entityType = filters.entityType;
        if (filters.entityId) params.entityId = filters.entityId;
      }

      switch (activeTab) {
        case "recent":
          response = await auditService.getRecentLogs(params);
          break;
        case "my":
          response = await auditService.getMyLogs(params);
          break;
        case "entity":
          response = await auditService.getLogsByEntity(params);
          break;
        default:
          response = await auditService.getMyLogs(params);
      }

      const logsData = response.data || response.logs || response || [];
      setLogs(Array.isArray(logsData) ? logsData : []);

      setPagination({
        ...pagination,
        total: response.total || response.count || logsData.length || 0,
        totalPages:
          response.totalPages ||
          Math.ceil((response.total || logsData.length) / pagination.limit) ||
          1,
      });
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
      CREATE: "success",
      UPDATE: "warning",
      DELETE: "error",
      LOGIN: "info",
      LOGOUT: "default",
      READ: "default",
    };
    return colorMap[action] || "default";
  };

  const getActionBgColor = (action) => {
    const bgColorMap = {
      CREATE: "#4caf50",
      UPDATE: "#ff9800",
      DELETE: "#f44336",
      LOGIN: "#2196f3",
      LOGOUT: "#9e9e9e",
      READ: "#607d8b",
    };
    return bgColorMap[action] || "#9e9e9e";
  };

  const actionOptions = [
    { value: "", label: "Tất cả hành động", color: "#4cbe00" },
    { value: "CREATE", label: "Create", color: getActionBgColor("CREATE") },
    { value: "UPDATE", label: "Update", color: getActionBgColor("UPDATE") },
    { value: "DELETE", label: "Delete", color: getActionBgColor("DELETE") },
    { value: "LOGIN", label: "Login", color: getActionBgColor("LOGIN") },
    { value: "LOGOUT", label: "Logout", color: getActionBgColor("LOGOUT") },
    { value: "READ", label: "Read", color: getActionBgColor("READ") },
  ];

  const handleReset = () => {
    setFilters({
      action: "",
      entityType: "",
      entityId: "",
      startDate: "",
      endDate: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh" }}>
      {/* Header with Gradient */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a3a3a 0%, #2d5a5a 100%)",
          borderRadius: 3,
          p: 3,
          mb: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, rgba(76,190,0,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              backgroundColor: "rgba(76,190,0,0.15)",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HistoryIcon sx={{ fontSize: 36, color: "#4cbe00" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#ffffff",
                mb: 0.5,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Audit Logs
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}
            >
              Track all system activities and user actions
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchLogs}
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Tabs with Modern Design */}
      <Paper
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPagination({ ...pagination, page: 1 });
          }}
          sx={{
            backgroundColor: "#ffffff",
            "& .MuiTabs-indicator": {
              height: 3,
              backgroundColor: "#4cbe00",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              minHeight: 64,
              color: "#666",
              transition: "all 0.3s",
              "&:hover": {
                color: "#4cbe00",
                backgroundColor: "rgba(76,190,0,0.05)",
              },
              "&.Mui-selected": {
                color: "#4cbe00",
              },
            },
          }}
        >
          {isAdmin && <Tab label="Recent Activity" value="recent" icon={<InfoIcon />} iconPosition="start" />}
          <Tab label="My Activity" value="my" icon={<HistoryIcon />} iconPosition="start" />
          {isAdmin && <Tab label="By Entity" value="entity" icon={<SearchIcon />} iconPosition="start" />}
        </Tabs>
      </Paper>

      {/* Filters with Better Layout */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: "#1a3a3a",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FilterIcon /> Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Action"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                size="small"
                variant="outlined"
                fullWidth
                SelectProps={{
                  MenuProps: {
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    PaperProps: {
                      sx: {
                        minWidth: "100px !important",
                        maxWidth: "250px",
                        maxHeight: "300px",
                        mt: 0.5,
                        "& .MuiMenuItem-root": {
                          color: "#212121",
                          fontWeight: 400,
                          padding: "8px 16px",
                          fontSize: "14px",
                          minHeight: "36px",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                            color: "#212121",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#e8f5e9",
                            color: "#212121",
                            fontWeight: 600,
                            "&:hover": {
                              backgroundColor: "#c8e6c9",
                            },
                          },
                        },
                      },
                    },
                  },
                }}
                sx={{
                  minWidth: "100px",
                  "& .MuiInputBase-input": {
                    color: "#212121",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666666",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#999",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#999",
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: "#212121" }}>All Actions</MenuItem>
                <MenuItem value="CREATE" sx={{ color: "#212121" }}>Create</MenuItem>
                <MenuItem value="UPDATE" sx={{ color: "#212121" }}>Update</MenuItem>
                <MenuItem value="DELETE" sx={{ color: "#212121" }}>Delete</MenuItem>
                <MenuItem value="LOGIN" sx={{ color: "#212121" }}>Login</MenuItem>
                <MenuItem value="LOGOUT" sx={{ color: "#212121" }}>Logout</MenuItem>
                <MenuItem value="READ" sx={{ color: "#212121" }}>Read</MenuItem>
              </TextField>
            </Grid>

            {activeTab === "entity" && (
              <>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    label="Entity Type"
                    placeholder="Garden, Vegetable, User"
                    value={filters.entityType}
                    onChange={(e) =>
                      setFilters({ ...filters, entityType: e.target.value })
                    }
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "#212121",
                      },
                      "& .MuiInputLabel-root": {
                        color: "#666666",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ddd",
                        },
                        "&:hover fieldset": {
                          borderColor: "#999",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4cbe00",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    label="Entity ID"
                    placeholder="Enter ID"
                    value={filters.entityId}
                    onChange={(e) =>
                      setFilters({ ...filters, entityId: e.target.value })
                    }
                    size="small"
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "#212121",
                      },
                      "& .MuiInputLabel-root": {
                        color: "#666666",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ddd",
                        },
                        "&:hover fieldset": {
                          borderColor: "#999",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4cbe00",
                        },
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={activeTab === "entity" ? 2.4 : 3}>
              <TextField
                type="date"
                label="From Date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                size="small"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#212121",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666666",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#999",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4cbe00",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={activeTab === "entity" ? 2.4 : 3}>
              <TextField
                type="date"
                label="To Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                size="small"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  "& .MuiInputBase-input": {
                    color: "#212121",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666666",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#999",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4cbe00",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={activeTab === "entity" ? 2.4 : 3}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setPagination({ ...pagination, page: 1 });
                    fetchLogs();
                  }}
                  fullWidth
                  sx={{
                    backgroundColor: "#4cbe00",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#3da000",
                    },
                  }}
                >
                  Apply
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
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            mb: 2,
            borderRadius: 2,
            "& .MuiAlert-icon": {
              fontSize: 24,
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Table with Enhanced Design */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 8,
              gap: 2,
            }}
          >
            <CircularProgress size={48} sx={{ color: "#4cbe00" }} />
            <Typography color="textSecondary">Loading audit logs...</Typography>
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead
              sx={{
                backgroundColor: "#102216",
                "& .MuiTableCell-root": {
                  backgroundColor: "#102216",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  border: "none",
                  padding: "18px 16px",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableRow>
                <TableCell sx={{ width: "180px" }}>Timestamp</TableCell>
                <TableCell sx={{ width: "150px" }}>User</TableCell>
                <TableCell sx={{ width: "120px" }}>Action</TableCell>
                <TableCell sx={{ width: "200px" }}>Entity</TableCell>
                <TableCell sx={{ width: "150px" }}>IP Address</TableCell>
                <TableCell align="center" sx={{ width: "100px" }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow
                    key={log.id || index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f7f9f7" : "#ffffff",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "#eef7ef",
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 8px rgba(76,190,0,0.1)",
                      },
                      "& td": {
                        padding: "14px 16px",
                        borderBottom: "1px solid #e8e8e8",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#102216",
                        fontSize: "13px",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatDate(log.timestamp || log.createdAt)}
                    </TableCell>
                    <TableCell sx={{ color: "#102216", fontWeight: 600 }}>
                      {log.username ||
                        log.user?.name ||
                        log.user?.email ||
                        log.userId ||
                        "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        sx={{
                          backgroundColor: getActionBgColor(log.action),
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "11px",
                          letterSpacing: "0.5px",
                          height: "24px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {(log.entityType || log.entity) ? (
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#102216",
                              fontWeight: 600,
                              fontSize: "13px",
                            }}
                          >
                            {log.entityType || log.entity}
                          </Typography>
                          {log.entityId && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#4d4d4d",
                                fontSize: "11px",
                              }}
                            >
                              ID: {log.entityId}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography sx={{ color: "#777" }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#4d4d4d",
                        fontSize: "13px",
                        fontFamily: "monospace",
                      }}
                    >
                      {log.ipAddress || log.ip || "-"}
                    </TableCell>
                    <TableCell align="center">
                      {log.details || log.metadata || log.changes ? (
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
                              backgroundColor: "rgba(76,190,0,0.05)",
                            },
                          }}
                        >
                          View
                        </Button>
                      ) : (
                        <Typography sx={{ color: "#777" }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <HistoryIcon sx={{ fontSize: 64, color: "#ccc" }} />
                      <Typography variant="h6" sx={{ color: "#4d4d4d" }}>
                        No Audit Logs Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        Try adjusting your filters or date range
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Enhanced Pagination */}
      {logs.length > 0 && (
        <Card
          sx={{
            mt: 3,
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    fontWeight: 500,
                  }}
                >
                  Total: <strong style={{ color: "#4cbe00" }}>{pagination.total}</strong> logs
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#999",
                    fontSize: "13px",
                  }}
                >
                  Page {pagination.page} of {pagination.totalPages}
                </Typography>
              </Box>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(e, page) => setPagination({ ...pagination, page })}
                color="primary"
                disabled={loading}
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 600,
                    "&.Mui-selected": {
                      backgroundColor: "#4cbe00",
                      "&:hover": {
                        backgroundColor: "#3da000",
                      },
                    },
                  },
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Details Dialog */}
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
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedLog && (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                  Action:
                </Typography>
                <Chip
                  label={selectedLog.action}
                  size="small"
                  sx={{
                    backgroundColor: getActionBgColor(selectedLog.action),
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

                <Typography variant="body2" sx={{ fontWeight: 700, color: "#666" }}>
                  User:
                </Typography>
                <Typography variant="body2" sx={{ color: "#333" }}>
                  {selectedLog.username ||
                    selectedLog.user?.name ||
                    selectedLog.user?.email ||
                    selectedLog.userId ||
                    "Unknown"}
                </Typography>

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
              </Box>

              {(selectedLog.details ||
                selectedLog.metadata ||
                selectedLog.changes) && (
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#666",
                      mb: 1,
                    }}
                  >
                    Changes/Details:
                  </Typography>
                  <Paper
                    sx={{
                      backgroundColor: "#1e1e1e",
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
                        selectedLog.details ||
                          selectedLog.metadata ||
                          selectedLog.changes,
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
              backgroundColor: "#4cbe00",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                backgroundColor: "#3da000",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;

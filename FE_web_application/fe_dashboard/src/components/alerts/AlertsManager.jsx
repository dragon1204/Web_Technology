import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as ResolveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useApi, usePaginatedApi } from "../../hooks/useApi";
import { alertAPI } from "../../services/api";

const AlertsManager = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertRules, setAlertRules] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(false);

  const [ruleForm, setRuleForm] = useState({
    name: "",
    description: "",
    condition: "",
    threshold: "",
    severity: "medium",
    isActive: true,
  });

  // Load data on component mount
  useEffect(() => {
    loadActiveAlerts();
    loadAlertRules();
    loadActiveCount();
  }, []);

  const loadActiveAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertAPI.getAll({ status: "active" });
      setActiveAlerts(response.data.data || response.data);
    } catch (error) {
      console.error("Error loading active alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlertRules = async () => {
    try {
      const response = await alertAPI.getRules();
      setAlertRules(response.data.data || response.data);
    } catch (error) {
      console.error("Error loading alert rules:", error);
    }
  };

  const loadActiveCount = async () => {
    try {
      const response = await alertAPI.getActiveCount();
      setActiveCount(response.data.count || 0);
    } catch (error) {
      console.error("Error loading active count:", error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await alertAPI.resolve(alertId);
      setActiveAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      setActiveCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const handleCreateRule = async () => {
    try {
      await alertAPI.createRule(ruleForm);
      setRuleDialogOpen(false);
      setRuleForm({
        name: "",
        description: "",
        condition: "",
        threshold: "",
        severity: "medium",
        isActive: true,
      });
      loadAlertRules();
    } catch (error) {
      console.error("Error creating alert rule:", error);
    }
  };

  const handleUpdateRule = async () => {
    try {
      await alertAPI.updateRule(editingRule.id, ruleForm);
      setRuleDialogOpen(false);
      setEditingRule(null);
      setRuleForm({
        name: "",
        description: "",
        condition: "",
        threshold: "",
        severity: "medium",
        isActive: true,
      });
      loadAlertRules();
    } catch (error) {
      console.error("Error updating alert rule:", error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm("Are you sure you want to delete this alert rule?")) {
      try {
        await alertAPI.deleteRule(ruleId);
        loadAlertRules();
      } catch (error) {
        console.error("Error deleting alert rule:", error);
      }
    }
  };

  const openRuleDialog = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        name: rule.name,
        description: rule.description,
        condition: rule.condition,
        threshold: rule.threshold,
        severity: rule.severity,
        isActive: rule.isActive,
      });
    } else {
      setEditingRule(null);
      setRuleForm({
        name: "",
        description: "",
        condition: "",
        threshold: "",
        severity: "medium",
        isActive: true,
      });
    }
    setRuleDialogOpen(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Alerts Management
      </Typography>

      {/* Active Alerts Summary */}
      <Alert severity={activeCount > 0 ? "warning" : "success"} sx={{ mb: 3 }}>
        {activeCount > 0
          ? `You have ${activeCount} active alert(s) that need attention.`
          : "All alerts are resolved. System is running normally."}
      </Alert>

      <Grid container spacing={3}>
        {/* Active Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">
                  Active Alerts ({activeCount})
                </Typography>
                <Button onClick={loadActiveAlerts} disabled={loading}>
                  Refresh
                </Button>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : activeAlerts.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={3}
                >
                  No active alerts
                </Typography>
              ) : (
                <List>
                  {activeAlerts.map((alert) => (
                    <ListItem key={alert.id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <WarningIcon color="warning" />
                            <Typography variant="subtitle2">
                              {alert.title}
                            </Typography>
                            <Chip
                              label={alert.severity}
                              size="small"
                              color={getSeverityColor(alert.severity)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {alert.description}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(alert.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleResolveAlert(alert.id)}
                          title="Resolve alert"
                        >
                          <ResolveIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alert Rules */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">
                  Alert Rules ({alertRules.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openRuleDialog()}
                >
                  Add Rule
                </Button>
              </Box>

              {alertRules.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={3}
                >
                  No alert rules configured
                </Typography>
              ) : (
                <List>
                  {alertRules.map((rule) => (
                    <ListItem key={rule.id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {rule.name}
                            </Typography>
                            <Chip
                              label={rule.severity}
                              size="small"
                              color={getSeverityColor(rule.severity)}
                            />
                            <Chip
                              label={rule.isActive ? "Active" : "Inactive"}
                              size="small"
                              color={rule.isActive ? "success" : "default"}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {rule.description}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => openRuleDialog(rule)}
                          title="Edit rule"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteRule(rule.id)}
                          title="Delete rule"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Rule Dialog */}
      <Dialog
        open={ruleDialogOpen}
        onClose={() => setRuleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRule ? "Edit Alert Rule" : "Create Alert Rule"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Name"
                value={ruleForm.name}
                onChange={(e) =>
                  setRuleForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={ruleForm.description}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Condition"
                value={ruleForm.condition}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    condition: e.target.value,
                  }))
                }
                placeholder="e.g., temperature > 30"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Threshold"
                value={ruleForm.threshold}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    threshold: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={ruleForm.severity}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      severity: e.target.value,
                    }))
                  }
                  label="Severity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRuleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editingRule ? handleUpdateRule : handleCreateRule}
            variant="contained"
          >
            {editingRule ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertsManager;

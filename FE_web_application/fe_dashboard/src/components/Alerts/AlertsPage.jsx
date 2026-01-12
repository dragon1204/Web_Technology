import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Done as DoneIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { alertsAPI } from "../../services/api";

function AlertsPage() {
  const [tab, setTab] = useState(0);

  // Alerts
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [filters, setFilters] = useState({ gardenId: "", isResolved: "" });
  const [activeCount, setActiveCount] = useState(0);

  // Rules
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editRuleId, setEditRuleId] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    gardenId: "",
    sensorId: "",
    minValue: "",
    maxValue: "",
    alertOnMin: true,
    alertOnMax: true,
    severity: "warning",
    isActive: true,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAlerts();
    fetchRules();
  }, []);

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.gardenId) params.gardenId = filters.gardenId;
      if (filters.isResolved !== "") params.isResolved = filters.isResolved === "true";
      const [listRes, activeRes] = await Promise.all([
        alertsAPI.list(params),
        alertsAPI.activeCount(filters.gardenId ? { gardenId: filters.gardenId } : {}),
      ]);
      
      // Handle pagination response structure: 
      // Axios response: response.data = { HttpCode, success, data: { items: [...], total, page, ... } }
      // So we need: response.data.data.items
      const alertsData = listRes.data?.data?.items || listRes.data?.items || listRes.data?.data || listRes.data || [];
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      
      // Handle active count response structure
      const count = activeRes.data?.data?.count || activeRes.data?.count || 0;
      setActiveCount(count);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError(err.response?.data?.message || "Failed to load alerts");
      setAlerts([]); // Ensure alerts is always an array
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const res = await alertsAPI.listRules();
      // Handle pagination response structure: 
      // Axios response: response.data = { HttpCode, success, data: { items: [...], total, page, ... } }
      // So we need: response.data.data.items
      const rulesData = res.data?.data?.items || res.data?.items || res.data?.data || res.data || [];
      setRules(Array.isArray(rulesData) ? rulesData : []);
    } catch (err) {
      console.error("Error fetching rules:", err);
      setError(err.response?.data?.message || "Failed to load rules");
      setRules([]); // Ensure rules is always an array
    } finally {
      setRulesLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertsAPI.resolve(id);
      setSuccess("Alert resolved");
      fetchAlerts();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resolve alert");
    }
  };

  const openRuleDialog = (rule = null) => {
    if (rule) {
      setEditRuleId(rule.id || rule._id);
      setRuleForm({
        gardenId: rule.gardenId || "",
        sensorId: rule.sensorId || "",
        minValue: rule.minValue ?? "",
        maxValue: rule.maxValue ?? "",
        alertOnMin: Boolean(rule.alertOnMin),
        alertOnMax: Boolean(rule.alertOnMax),
        severity: rule.severity || "warning",
        isActive: rule.isActive !== false,
      });
    } else {
      setEditRuleId(null);
      setRuleForm({
        gardenId: "",
        sensorId: "",
        minValue: "",
        maxValue: "",
        alertOnMin: true,
        alertOnMax: true,
        severity: "warning",
        isActive: true,
      });
    }
    setRuleDialogOpen(true);
  };

  const handleSaveRule = async () => {
    const payload = {
      ...ruleForm,
      minValue: ruleForm.minValue === "" ? null : Number(ruleForm.minValue),
      maxValue: ruleForm.maxValue === "" ? null : Number(ruleForm.maxValue),
    };
    try {
      if (editRuleId) {
        await alertsAPI.updateRule(editRuleId, payload);
        setSuccess("Rule updated");
      } else {
        await alertsAPI.createRule(payload);
        setSuccess("Rule created");
      }
      fetchRules();
      setRuleDialogOpen(false);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save rule");
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await alertsAPI.deleteRule(id);
      setSuccess("Rule deleted");
      fetchRules();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete rule");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Alerts
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Alerts (${activeCount} active)`} />
        <Tab label="Rules" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Garden ID"
              size="small"
              value={filters.gardenId}
              onChange={(e) => setFilters({ ...filters, gardenId: e.target.value })}
            />
            <TextField
              label="Resolved?"
              size="small"
              select
              value={filters.isResolved}
              onChange={(e) => setFilters({ ...filters, isResolved: e.target.value })}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="false">Active</MenuItem>
              <MenuItem value="true">Resolved</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAlerts}
            >
              Refresh
            </Button>
          </Stack>

          {alertsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Message</TableCell>
                    <TableCell>Garden</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id || alert._id} hover>
                      <TableCell>{alert.message || alert.title || "(No message)"}</TableCell>
                      <TableCell>{alert.gardenId ?? "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={alert.severity || "info"}
                          color={alert.severity === "critical" ? "error" : alert.severity === "warning" ? "warning" : "info"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.isResolved ? "Resolved" : "Active"}
                          color={alert.isResolved ? "default" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {!alert.isResolved && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleResolve(alert.id || alert._id)}
                            title="Resolve"
                          >
                            <DoneIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!alerts.length && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No alerts
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openRuleDialog()}
            >
              New Rule
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchRules}>
              Refresh
            </Button>
          </Stack>

          {rulesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Garden</TableCell>
                    <TableCell>Sensor</TableCell>
                    <TableCell>Min</TableCell>
                    <TableCell>Max</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id || rule._id} hover>
                      <TableCell>{rule.gardenId ?? "-"}</TableCell>
                      <TableCell>{rule.sensorId ?? "-"}</TableCell>
                      <TableCell>{rule.minValue ?? "-"}</TableCell>
                      <TableCell>{rule.maxValue ?? "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={rule.severity || "info"}
                          color={rule.severity === "critical" ? "error" : rule.severity === "warning" ? "warning" : "info"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rule.isActive === false ? "Inactive" : "Active"}
                          color={rule.isActive === false ? "default" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openRuleDialog(rule)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRule(rule.id || rule._id)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!rules.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No rules
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Dialog open={ruleDialogOpen} onClose={() => setRuleDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editRuleId ? "Edit Rule" : "New Rule"}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Garden ID"
                  value={ruleForm.gardenId}
                  onChange={(e) => setRuleForm({ ...ruleForm, gardenId: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Sensor ID"
                  value={ruleForm.sensorId}
                  onChange={(e) => setRuleForm({ ...ruleForm, sensorId: e.target.value })}
                  fullWidth
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Min Value"
                    type="number"
                    value={ruleForm.minValue}
                    onChange={(e) => setRuleForm({ ...ruleForm, minValue: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Max Value"
                    type="number"
                    value={ruleForm.maxValue}
                    onChange={(e) => setRuleForm({ ...ruleForm, maxValue: e.target.value })}
                    fullWidth
                  />
                </Stack>
                <TextField
                  select
                  label="Severity"
                  value={ruleForm.severity}
                  onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="info">info</MenuItem>
                  <MenuItem value="warning">warning</MenuItem>
                  <MenuItem value="critical">critical</MenuItem>
                </TextField>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ruleForm.alertOnMin}
                      onChange={(e) => setRuleForm({ ...ruleForm, alertOnMin: e.target.checked })}
                    />
                  }
                  label="Alert on Min"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ruleForm.alertOnMax}
                      onChange={(e) => setRuleForm({ ...ruleForm, alertOnMax: e.target.checked })}
                    />
                  }
                  label="Alert on Max"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ruleForm.isActive}
                      onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRuleDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveRule}>
                {editRuleId ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}

export default AlertsPage;

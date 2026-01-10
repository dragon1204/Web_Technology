import { useState, useCallback } from "react";
import { analyticsAPI } from "../services/api";

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeAnalytics = useCallback(async (apiFunction, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(params);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revenue Analytics
  const getRevenuePeriod = useCallback(
    (params) => executeAnalytics(analyticsAPI.getRevenuePeriod, params),
    [executeAnalytics]
  );

  const compareGardens = useCallback(
    (params) => executeAnalytics(analyticsAPI.compareGardens, params),
    [executeAnalytics]
  );

  const getTopProducts = useCallback(
    (params) => executeAnalytics(analyticsAPI.getTopProducts, params),
    [executeAnalytics]
  );

  // Productivity Analytics
  const getProductivityByCategory = useCallback(
    (params) =>
      executeAnalytics(analyticsAPI.getProductivityByCategory, params),
    [executeAnalytics]
  );

  const getSalesInventoryRatio = useCallback(
    (params) => executeAnalytics(analyticsAPI.getSalesInventoryRatio, params),
    [executeAnalytics]
  );

  const getProductivityTrend = useCallback(
    (params) => executeAnalytics(analyticsAPI.getProductivityTrend, params),
    [executeAnalytics]
  );

  // Sensor Analytics
  const getSensorAnalysis = useCallback(
    (params) => executeAnalytics(analyticsAPI.getSensorAnalysis, params),
    [executeAnalytics]
  );

  const getOptimalConditions = useCallback(
    (params) => executeAnalytics(analyticsAPI.getOptimalConditions, params),
    [executeAnalytics]
  );

  // Custom Reports
  const createCustomReport = useCallback(
    (data) => executeAnalytics(analyticsAPI.createCustomReport, data),
    [executeAnalytics]
  );

  return {
    loading,
    error,
    // Revenue Analytics
    getRevenuePeriod,
    compareGardens,
    getTopProducts,
    // Productivity Analytics
    getProductivityByCategory,
    getSalesInventoryRatio,
    getProductivityTrend,
    // Sensor Analytics
    getSensorAnalysis,
    getOptimalConditions,
    // Custom Reports
    createCustomReport,
  };
};

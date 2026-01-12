import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

export const useApi = () => {
  const { token, refreshToken } = useAuth();

  const apiCall = useCallback(
    async (url, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Handle token expiration
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the request with new token
            headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });
            return retryResponse;
          }
        }

        return response;
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    [token, refreshToken]
  );

  return { apiCall };
};

export const useApiCall = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiCall } = useApi();

  const execute = useCallback(
    async (customUrl = url, customOptions = options) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall(customUrl, customOptions);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "API call failed");
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, options, apiCall]
  );

  return { data, loading, error, execute };
};

export const usePaginatedApi = (baseUrl, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiCall } = useApi();

  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        ...initialParams,
        ...params,
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
      });

      try {
        const response = await apiCall(`${baseUrl}?${queryParams}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch data");
        }

        const result = await response.json();

        setData(result.data || result.items || []);
        setPagination({
          page: result.page || 1,
          limit: result.limit || 10,
          total: result.total || 0,
          totalPages:
            result.totalPages ||
            Math.ceil((result.total || 0) / (result.limit || 10)),
        });

        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, initialParams, pagination.page, pagination.limit, apiCall]
  );

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      fetchData({ page: pagination.page + 1 });
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      fetchData({ page: pagination.page - 1 });
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchData({ page });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    fetchData,
    nextPage,
    prevPage,
    goToPage,
    refresh: () => fetchData({ page: pagination.page }),
  };
};

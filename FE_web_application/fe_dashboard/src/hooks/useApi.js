import { useState, useEffect, useCallback } from "react";

// Generic hook for API calls
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute };
};

// Hook for automatic API calls on mount
export const useApiEffect = (apiFunction, dependencies = []) => {
  const { data, loading, error, execute } = useApi(apiFunction, dependencies);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
};

// Hook for paginated data
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction({
          ...initialParams,
          ...params,
          page: params.page || pagination.page,
          limit: params.limit || pagination.limit,
        });

        setData(response.data.data || response.data);
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
          page: params.page || prev.page,
          limit: params.limit || prev.limit,
        }));

        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, initialParams]
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
    fetchData({ page });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
    nextPage,
    prevPage,
    goToPage,
  };
};

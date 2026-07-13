import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: false, error: null });

  const execute = useCallback(async (apiCall: () => Promise<any>, onSuccess?: (data: T) => void) => {
    setState({ data: null, loading: true, error: null });
    try {
      const res = await apiCall();
      const data = res.data?.data || res.data;
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Request failed';
      setState({ data: null, loading: false, error: msg });
      return null;
    }
  }, []);

  return { ...state, execute };
}

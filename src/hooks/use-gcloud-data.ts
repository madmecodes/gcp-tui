import { useState, useEffect, useCallback, useRef } from "react";

interface UseGcloudDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

export function useGcloudData<T>(
  fetcher: () => Promise<T>,
  refreshInterval = 30_000,
): UseGcloudDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [trigger, setTrigger] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current();
        if (!cancelled) {
          setData(result);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [trigger]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    intervalRef.current = setInterval(() => {
      setTrigger((t) => t + 1);
    }, refreshInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshInterval]);

  return { data, loading, error, refresh, lastUpdated };
}

// useApi - the data-fetching pattern used by every page.
//
// A page needs three things for each API call: the data, a loading flag, and
// any error. Writing that by hand in every component is repetitive and easy to
// get wrong (forgetting to reset error, setting state after unmount, etc).
// This hook does it once.
//
// Usage:
//   const { data, loading, error, reload } = useApi(() => api.score.me(), []);
//
// The second argument is a dependency array, exactly like useEffect: the call
// re-runs when any dependency changes.

import { useCallback, useEffect, useState } from "react";

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, reload: run };
}

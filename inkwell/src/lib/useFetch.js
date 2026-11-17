import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

/** GET a URL; returns data plus a setter for optimistic updates. Pass null to skip. */
export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: !!url, error: null });
  const seq = useRef(0);

  const load = useCallback(async (opts = {}) => {
    if (!url) return;
    const id = ++seq.current;
    if (!opts.silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get(url);
      if (id === seq.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === seq.current) setState((s) => ({ ...s, loading: false, error }));
    }
  }, [url]);

  useEffect(() => { load(); }, [load]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, setData, reload: load };
}

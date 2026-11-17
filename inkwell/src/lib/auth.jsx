import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.get('/api/auth/me').then((d) => setUser(d.user)).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, password) => (await api.post('/api/auth/login', { email, password })).user, []);
  const value = useMemo(() => ({
    user, ready, setUser,
    isEditor: user?.role === 'editor',
    login: async (email, password) => { const u = await login(email, password); setUser(u); return u; },
    register: async (form) => { const { user: u } = await api.post('/api/auth/register', form); setUser(u); return u; },
    demo: async (account) => { const { user: u } = await api.post('/api/auth/demo', { account }); setUser(u); return u; },
    logout: async () => { try { await api.post('/api/auth/logout'); } finally { tokenStore.set(null); setUser(null); } },
    update: async (patch) => { const { user: u } = await api.patch('/api/auth/me', patch); setUser(u); return u; },
  }), [user, ready, login]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

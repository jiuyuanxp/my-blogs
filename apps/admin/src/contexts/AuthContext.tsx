import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getToken, getMe, clearToken, type MeResponse } from '@/lib/api';

interface AuthContextValue {
  user: MeResponse | null;
  permissions: string[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  hasMenu: (menu: string) => boolean;
  hasButton: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const permissions = user?.permissions ?? [];

  const hasPermission = useCallback((code: string) => permissions.includes(code), [permissions]);

  const hasMenu = useCallback((menu: string) => hasPermission(`menu:${menu}`), [hasPermission]);

  const hasButton = useCallback(
    (module: string, action: string) => hasPermission(`btn:${module}:${action}`),
    [hasPermission]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        refresh,
        hasPermission,
        hasMenu,
        hasButton,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

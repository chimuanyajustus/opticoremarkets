export interface AuthData {
  email: string;
  name: string;
  token: string;
}

const AUTH_STORAGE_KEY = 'opticoreMarketsAuth';

export const getStoredAuth = (): AuthData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) as AuthData : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const auth = getStoredAuth();
  return Boolean(auth?.token);
};

export const login = (email: string, name?: string): AuthData => {
  const authData: AuthData = {
    email,
    name: name || email.split('@')[0] || 'Trader',
    token: `tp_${Date.now()}`,
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }

  return authData;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export const getUserName = (): string => {
  const auth = getStoredAuth();
  return auth?.name || 'Trader';
};

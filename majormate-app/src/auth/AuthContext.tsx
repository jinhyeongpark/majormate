import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean | null;
  setAuthenticated: (v: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  setAuthenticated: () => {},
});

export function AuthProvider({
  children,
  initialValue,
}: {
  children: React.ReactNode;
  initialValue: boolean | null;
}) {
  const [isAuthenticated, setAuthenticated] = useState<boolean | null>(initialValue);
  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

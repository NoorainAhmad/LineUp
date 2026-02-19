import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string) => void; // ← refreshToken param removed
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    const accessToken = localStorage.getItem("access_token");

    if (savedUser && accessToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("access_token", accessToken);
    // refresh token is set as httpOnly cookie by server — nothing to do here
  };

  const logout = async () => {
    try {
      // Cookie is sent automatically — server will delete the DB row and clear the cookie
      await import("../services/auth.service").then(({ AuthService }) =>
        AuthService.logout()
      );
    } catch {
      // Always clear client state even if server call fails
    } finally {
      clearAuth();
    }
  };

  const logoutAllDevices = async () => {
    try {
      await import("../services/auth.service").then(({ AuthService }) =>
        AuthService.logoutAllDevices()
      );
    } catch {
      // Always clear client state
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    // Can't clear the cookie from JS — server clears it via Set-Cookie on logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        logoutAllDevices,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
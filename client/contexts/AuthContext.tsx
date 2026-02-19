import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import { AuthService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string) => void;
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
    try {
      const savedUser = localStorage.getItem("auth_user");
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        clearAuth();
        return;
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Corrupt storage → reset cleanly
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("access_token", accessToken);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // Ignore server errors — always clear client state
    } finally {
      clearAuth();
    }
  };

  const logoutAllDevices = async () => {
    try {
      await AuthService.logoutAllDevices();
    } catch {
    // Ignore server errors — always clear client state
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
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

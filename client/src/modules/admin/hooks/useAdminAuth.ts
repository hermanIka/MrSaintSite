import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

interface Admin {
  id: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    admin: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const adminData = localStorage.getItem("admin_data");
    
    if (token && adminData) {
      try {
        const admin = JSON.parse(adminData);
        setAuthState({
          isAuthenticated: true,
          admin,
          token,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
        setAuthState({
          isAuthenticated: false,
          admin: null,
          token: null,
          isLoading: false,
        });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/admin/login", { username, password });
    const data = await response.json();
    
    if (data.token && data.admin) {
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_data", JSON.stringify(data.admin));
      setAuthState({
        isAuthenticated: true,
        admin: data.admin,
        token: data.token,
        isLoading: false,
      });
      return { success: true };
    }
    
    return { success: false, error: data.error || "Erreur de connexion" };
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch {
        // Ignorer les erreurs de déconnexion
      }
    }
    
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    setAuthState({
      isAuthenticated: false,
      admin: null,
      token: null,
      isLoading: false,
    });
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders,
  };
}

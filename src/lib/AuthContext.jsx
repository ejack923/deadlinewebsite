import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({
    id: "standalone",
    public_settings: {
      auth_required: false,
      mode: "standalone",
    },
  });

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const currentUser = await base44.auth.me();
        if (!active) return;
        setUser(currentUser);
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (error) {
        if (!active) return;
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: "unknown",
          message: error?.message || "Failed to load local user",
        });
      } finally {
        if (active) {
          setIsLoadingAuth(false);
        }
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const checkAppState = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setIsAuthenticated(true);
    setAuthError(null);
    return currentUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

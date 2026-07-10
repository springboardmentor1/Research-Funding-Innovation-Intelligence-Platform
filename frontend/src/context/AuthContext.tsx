import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "researcher" | "startup_founder" | "innovation_manager" | "administrator";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  orcid?: string;
  organization?: string;
  domain?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchAllUsers: () => Promise<UserProfile[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://localhost:8000/api/v1";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("lumen_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token might have expired or been deleted from DB
        logout();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: str) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("lumen_token", data.access_token);
      setToken(data.access_token);
      await fetchCurrentUser(data.access_token);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Registration failed");
      }

      // Automatically log in after registration
      await login(email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("lumen_token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Profile update failed");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const fetchAllUsers = async (): Promise<UserProfile[]> => {
    if (!token) {
      throw new Error("Not authenticated");
    }
    const response = await fetch(`${API_URL}/users/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || "Failed to fetch users");
    }
    return response.json();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        fetchAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

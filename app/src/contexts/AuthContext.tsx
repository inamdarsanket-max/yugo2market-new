import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const register = async (formData: any) => {
    try {
      setLoading(true);

      const res = await axios.post(`${API}/auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role || "brand",
        phone: formData.phone || "",
        companyName: formData.companyName || ""
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const res = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem("token"));
const [loading, setLoading] = useState(false);

// 🔹 Setup axios interceptor
useEffect(() => {
if (token) {
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
delete axios.defaults.headers.common["Authorization"];
}
}, [token]);

// 🔹 Register
const register = async (formData) => {
try {
setLoading(true);

```
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
} catch (err) {
  console.error("REGISTER ERROR:", err.response?.data || err.message);

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
```

};

// 🔹 Login
const login = async (email, password) => {
try {
setLoading(true);

```
  const res = await axios.post(`${API}/auth/login`, {
    email,
    password,
  });

  const { token, user } = res.data;

  localStorage.setItem("token", token);
  setToken(token);
  setUser(user);

  return { success: true };
} catch (err) {
  console.error("LOGIN ERROR:", err.response?.data || err.message);

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
```

};

// 🔹 Logout
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

// 🔹 Hook
export const useAuth = () => useContext(AuthContext);

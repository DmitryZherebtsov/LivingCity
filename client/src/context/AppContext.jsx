import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [isLoggedin, setIsLoggedin] = useState(
    JSON.parse(localStorage.getItem("isLoggedin")) || false
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );

  // 🔹 Збереження стану логіну
  const persistLoginState = (loggedIn, userData = null, token = null) => {
    setIsLoggedin(loggedIn);
    localStorage.setItem("isLoggedin", JSON.stringify(!!loggedIn));

    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }

    if (token) {
      setAccessToken(token);
      localStorage.setItem("accessToken", token);
    } else {
      setAccessToken(null);
      localStorage.removeItem("accessToken");
    }
  };

  const getUserData = async () => {
  try {
    const resp = await api.get("/api/users/me");

    if (resp?.data) {
      setUser(resp.data);
      localStorage.setItem("user", JSON.stringify(resp.data));
      setIsLoggedin(true);
      return resp.data;
    }

    return null;
  } catch (err) {
    console.error("getUserData error:", err.response?.status);

    // ❌ НЕ чіпаємо токен тут
    // persistLoginState(false, null, null);

    return null;
  }
};


  // 🔹 Login
  const login = async ({ email, password }) => {
    try {
      const resp = await api.post("/api/public-auth/login", {
        email,
        password,
      });

      const { accessToken, user } = resp.data;

      persistLoginState(true, user, accessToken);

      return { ok: true };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Login failed";
      return { ok: false, message };
    }
  };

  // 🔹 Register
  const register = async (formData) => {
    try {
      const resp = await api.post(
        "/api/public-auth/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return { ok: true, data: resp.data };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Register failed";
      return { ok: false, message };
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await api.post("/api/public-auth/logout");
    } catch (err) {
    } finally {
      persistLoginState(false, null, null);
    }
  };

  // 🔹 Авто-логін при перезавантаженні сторінки
  useEffect(() => {
  if (localStorage.getItem("accessToken")) {
    getUserData();
  }
}, []);


  return (
    <AppContext.Provider
      value={{
        backendUrl,
        isLoggedin,
        user,
        getUserData,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from "react";
import { login as loginRequest, register as registerRequest, logout as logoutRequest, fetchCurrentUser } from "../services/authApi";
import { getErrorMessage } from "../utils/errors";

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
      const data = await fetchCurrentUser();

      if (data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        setIsLoggedin(true);
        return data;
      }

      return null;
    } catch (err) {
      console.error("getUserData error:", err.response?.status);
      return null;
    }
  };

  const login = async ({ email, password }) => {
    try {
      const { accessToken, user } = await loginRequest({ email, password });

      persistLoginState(true, user, accessToken);

      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err, "Login failed") };
    }
  };

  const register = async (formData) => {
    try {
      const data = await registerRequest(formData);

      return { ok: true, data };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err, "Register failed") };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
    } finally {
      persistLoginState(false, null, null);
    }
  };

  
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

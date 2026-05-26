import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUserState] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const setUser = (userData) => setUserState(userData);

  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
  };

  const userId = user?.id || null;
  const setUserId = (id) => {
    if (id && user) setUserState({ ...user, id });
  };

  return (
    <UserContext.Provider value={{ user, setUser, userId, setUserId, logout, darkMode, toggleDarkMode }}>
      {children}
    </UserContext.Provider>
  );
}

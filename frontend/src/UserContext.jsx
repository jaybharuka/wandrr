import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUserState] = useState(() => {
    // Load user from localStorage on initial load
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Set user (from signup/signin)
  const setUser = (userData) => {
    setUserState(userData);
  };

  // Logout function
  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
  };

  // Legacy support for userId
  const userId = user?.id || null;
  const setUserId = (id) => {
    if (id && user) {
      setUserState({ ...user, id });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, userId, setUserId, logout }}>
      {children}
    </UserContext.Provider>
  );
}

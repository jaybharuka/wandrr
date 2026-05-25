import React, { createContext, useContext, useState, useEffect } from "react";
const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [userId, setUserIdState] = useState(() => {
    // Read from localStorage on initial load
    const stored = localStorage.getItem("userId");
    return stored ? Number(stored) : null;
  });

  // Update localStorage whenever userId changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
  }, [userId]);

  // Wrapper to update both state and localStorage
  const setUserId = (id) => {
    setUserIdState(id);
  };

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localCounter, setLocalCounter] = useState(0); // Add counter state

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
          setLocalCounter(res.counter || 0); // Initialize counter from user data
        } else {
          setIsLogged(false);
          setUser(null);
          setLocalCounter(0);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        localCounter, // Expose counter
        setLocalCounter, // Expose setter
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;

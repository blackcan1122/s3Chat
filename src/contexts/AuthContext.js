// AuthContext.js
import { createContext, useContext, useState } from "react";
import {GetBackendContext} from './BackendContext'

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const login = (username, password) => {
    const { InitializeBackend } = GetBackendContext();
  
    setUser(username);
    setPassword(password);
    InitializeBackend(username, password);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, password, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

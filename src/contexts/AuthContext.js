// AuthContext.js
import { createContext, useContext, useState } from "react";
import {useBackend} from './BackendContext'

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const { InitializeBackend } = useBackend();


  const login = (username, password) => {
  
    setUser(username);
    setPassword(password);
    try{
      InitializeBackend(username, password);
    }
    catch(err){
      console.log(err.message);
    }
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

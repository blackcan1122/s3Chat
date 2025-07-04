import React, {useState, useEffect, useContext, createContext} from "react";

const AuthContext = createContext();


export function UserProvider({children}){
  const [userData, setUserData] = useState({
    id: null,
    name: "",
    role: "",
    last_message_sent: Date.now()
  });

function SetupUser(name, role, id){
    setUserData(prev => ({
        ...prev,
        name,
        role,
        id,
        last_message_sent: Date.now()
    }));
}

  function UpdateTime(newTime) {
    if (typeof newTime !== "number" || isNaN(newTime)) {
      throw new Error("newTime must be a valid number");
    }
    setUserData(prev => ({
      
      ...prev,
      last_message_sent: newTime
    }));
  }

  function IsAdmin(){
      return (userData && userData.role == "Admin")
  }

  return (
  <AuthContext.Provider value={{ userData, UpdateTime, SetupUser, IsAdmin }}>
    {children}
  </AuthContext.Provider>
  );
}

export function useUserData() {
  return useContext(AuthContext);
}
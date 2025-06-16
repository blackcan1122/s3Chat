import React, {useState, useEffect, useContext, createContext} from "react";

const AuthContext = createContext();

export function UserProvider({children}){
    const [userData, setUserData] = useState(null);

    function SetupUser(name, role){
        setUserData(() => {
            return { name: name, role: role };
        });        
    }

    useEffect(() =>{
        console.log("Registered");
        console.log(JSON.stringify(userData));
    },[userData]);

    function IsAdmin(){
        return (userData && userData.role == "Admin")
    }

    return (
    <AuthContext.Provider value={{ userData, SetupUser, IsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUserData() {
  return useContext(AuthContext);
}
import React, {useState, useEffect, createContext, useContext, useRef} from 'react';
import {useAuth} from './AuthContext'

const AuthContext = createContext();

export function BackendProvider({children}){

    const BackendConnection = useRef(null);
    const [connected, setConnected] = useState(false);


    function InitializeBackend(Name, Passwort)
    {
        console.log(user);
        const ws = new WebSocket("ws://localhost:8000/ws/chat");
        ws.onopen = () => {
          console.log("Authentication initialized");
          ws.send(/* ??? */);
          BackendConnection.current = ws;
          setConnected(true);
        }
    }

    return (
    <AuthContext.Provider value={{ BackendConnection, InitializeBackend, connected }}>
      {children}
    </AuthContext.Provider>
  );

}

export function GetBackendContext() {
  return useContext(AuthContext);
}

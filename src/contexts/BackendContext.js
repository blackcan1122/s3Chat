import React, {useState, useEffect, createContext, useContext, useRef} from 'react';


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default getCookie;

const AuthContext = createContext();

export function BackendProvider({children}){

    const BackendConnection = useRef(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");



    function InitializeBackendWithSession(Username ,SessionID){
        console.log("We Initialize via Session")
        return new Promise((resolve, reject) => {
        const ws = new WebSocket(process.env.REACT_APP_BACKEND_URL);
        ws.onopen = () => {
            ws.send(JSON.stringify({username: Username, session_id: SessionID}));
        };
        ws.onmessage = (resp) => {
            const payload = JSON.parse(resp.data);
            if (payload.state === "AUTH_SUCCESS") {
                setConnected(true);
                BackendConnection.current = ws;
                ws.onmessage = null;
                resolve(); // Success!
            } else {
                setConnected(false);
                BackendConnection.current = null;
                reject(new Error("Invalid credentials"));
            }
        };
        ws.onerror = (err) => {
            reject(new Error("WebSocket error"));
        };
      });
    }

    function DeinitializeBackend()
    {
       document.cookie = `AutoLogin=${false}; path=/; max-age=${60 * 60}`;
      if (BackendConnection.current) {
      BackendConnection.current.close();
    }
    setConnected(false);
    }

    function InitializeBackend(Name, Passwort, SaveLogin)
    {
        console.log("We Initialize via Login")
        return new Promise((resolve, reject) => {
        const ws = new WebSocket(process.env.REACT_APP_BACKEND_URL);
        ws.onopen = () => {
            ws.send(JSON.stringify({ username: Name, password: Passwort }));
        };
        ws.onmessage = (resp) => {
            const payload = JSON.parse(resp.data);
            if (payload.state === "AUTH_SUCCESS") {
                setConnected(true);
                BackendConnection.current = ws;
                ws.onmessage = null;
                document.cookie = `username=${Name}; path=/; max-age=${60 * 60}`;
                document.cookie = `sessionId=${payload.session_id}; path=/; max-age=${60 * 60}`;
                document.cookie = `AutoLogin=${SaveLogin}; path=/; max-age=${60 * 60}`;
                resolve();
            } else {
                setConnected(false);
                BackendConnection.current = null;
                reject(new Error("Invalid credentials"));
            }
        };
        ws.onerror = (err) => {
            reject(new Error("WebSocket error"));
        };
      });
    }

    // Auto-login if cookie exists
    useEffect(() => {
      const username = getCookie('username');
      const sessionid = getCookie('sessionId');
      const keepLogin = getCookie('AutoLogin');
      console.log("Lets see");
      console.log(`username: ${username}, sessionid: ${sessionid}, connected: ${connected}, keeplogin: ${keepLogin}`);

      if (username && sessionid && !connected && keepLogin === "true") {
        console.log(`trying to login with session id: ${sessionid}`);
        try{
          InitializeBackendWithSession(username, sessionid);
        } 
        catch(err){
          setError(err.message);
        }

      }
    }, [connected]);

    return (
    <AuthContext.Provider value={{ BackendConnection, InitializeBackend, connected, DeinitializeBackend }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useBackend() {
  return useContext(AuthContext);
}

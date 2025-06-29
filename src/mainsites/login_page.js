import React, { useState, useEffect } from 'react';
import { useBackend } from '../contexts/BackendContext';
import { UserProvider } from '../contexts/userContext';
import getCookie from "../contexts/BackendContext";


function LoginPage() {
    const { InitializeBackend } = useBackend();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [saveLogin, setSaveLogin] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [status, setStatus] = useState("");

    async  function submitHandler(event) {
        event.preventDefault();
        if (username.trim().length <= 2 || password.trim().length <= 2){
          setStatus("Username or Password too Short\n Choose a Name and Password with atleast 3 Chars");
          return
        }
        try {
          
          if (isRegister) {
            const response = await fetch("/add_user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "omit"
            });
            if (response.ok)
            {
              setStatus("Registration succeed\n Approval from Admin required");
            }
          } 
          else {
            try{
              await InitializeBackend(username, password, saveLogin);
            }
            catch (err){
              setStatus(`${err}`);
            }
          }
        }
        catch (err) {
          console.error(err.message);
        }
  }

    // Setting username depending on cookie
    useEffect(() => {
        const cookieUsername = getCookie('username');
        if (cookieUsername) setUsername(cookieUsername);
    }, []);

    // Displaying a error message
    useEffect(() =>{

    }, [status]);

  return (
    <>
      <form onSubmit={submitHandler}>
        <h2>{isRegister ? "Register" : "Login"}</h2>

        {/* USERNAME */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* KEEP ME LOGGED IN */}
        {!isRegister && (
          <div className="checkbox-row">
            <input
              id="keep"
              type="checkbox"
              checked={saveLogin}
              onChange={(e) => setSaveLogin(e.target.checked)}
            />
            <label htmlFor="keep">Keep me logged in</label>
          </div>
        )}

        {/* REGISTER VS LOGIN TOGGLE */}
        <div className="checkbox-row">
          <input
            id="registerToggle"
            type="checkbox"
            checked={isRegister}
            onChange={(e) => setIsRegister(e.target.checked)}
          />
          <label htmlFor="registerToggle">I need an account</label>
        </div>

        <div className='status-display'>
          {status.split('\n').map((line, idx) => (
            <span key={idx}>{line}<br /></span>
          ))}
        </div>

        {/* SUBMIT */}
        <button type="submit">
          {isRegister ? "Create account" : "Login"}
        </button>
        <span><strong className='accent' style={{ fontSize: "1rem" }}>Due to change in the message system, please register again</strong></span>
      </form>
    </>
  );

}

export default LoginPage;

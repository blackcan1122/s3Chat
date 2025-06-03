import React, { useState, useEffect } from 'react';
import { useBackend } from '../contexts/BackendContext';
import getCookie from "../contexts/BackendContext";


function LoginPage() {
    const { InitializeBackend } = useBackend();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [savelogin, setSavelogin] = useState(false);

    async  function submitHandler(event) {
        event.preventDefault();
        try{
           await InitializeBackend(username, password, savelogin);
        }
        catch(err){
            console.log(err.message);
        }
        
    }

    // Setting username depending on cookie
    useEffect(() => {
        const cookieUsername = getCookie('username');
        if (cookieUsername) setUsername(cookieUsername);
    }, []);

return (
  <>
    <form onSubmit={submitHandler}>
      {/* USERNAME */}
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
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
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      {/* KEEP ME LOGGED IN */}
      <div className="checkbox-row">
        <input
          id="keep"
          type="checkbox"
          checked={savelogin}
          onChange={e => setSavelogin(e.target.checked)}
        />
        <label htmlFor="keep">Keep me logged in</label>
      </div>

      {/* SUBMIT */}
      <button type="submit">Login</button>
    </form>
  </>
);

}

export default LoginPage;

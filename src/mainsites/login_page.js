import React, { useState, useEffect } from 'react';
import { useBackend } from '../contexts/BackendContext';
import getCookie from "../contexts/BackendContext";


function LoginPage() {
    const { InitializeBackend } = useBackend();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [savelogin, setSavelogin] = useState(false);

    function submitHandler(event) {
        event.preventDefault();
        InitializeBackend(username, password, savelogin);
    }

    // Setting username depending on cookie
    useEffect(() => {
        const cookieUsername = getCookie('username');
        if (cookieUsername) setUsername(cookieUsername);
    }, []);

    return (
        <>
            <form onSubmit={submitHandler}>
                <p>Username</p>
                <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                />
                <p>Password</p>
                <input 
                    type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                />
                <label>
                    <input 
                        type="checkbox"
                        checked={savelogin} 
                        onChange={e => setSavelogin(e.target.checked)} 
                    />
                    Keep me logged in
                </label>
                <input type="submit" value="Login"/>
            </form>
        </>
    );
}

export default LoginPage;

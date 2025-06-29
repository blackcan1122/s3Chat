import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css';
import App from './mainsites/App.js';
import reportWebVitals from './reportWebVitals';
import {AuthProvider} from './contexts/AuthContext.js'
import {BackendProvider} from './contexts/BackendContext.js'
import {UserProvider} from './contexts/userContext.js'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
        <UserProvider>
            <BackendProvider>
                        <AuthProvider>
                                <App />
                        </AuthProvider>
            </BackendProvider>
        </UserProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React, {useState, useEffect} from 'react'
import {useAuth} from '../contexts/AuthContext'

function LoginPage(){

    const {user, login, logout} = useAuth();

    return(
        <>
            <form>
                <p>UserName</p>
                <input />
                <p>password</p>
                <input />
                <input type="submit" onSubmit={}/>
            </form>
        </>
    )
}

export default LoginPage;
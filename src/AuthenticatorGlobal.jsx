import {useState} from 'react';
import {AuthedContext as AuthedContext1} from "./AuthedContext.jsx";


export const AuthProvider = ({ children }) => {
    const [UserData, setUserData] = useState(() => {
        const saved = localStorage.getItem('UserData');
        return saved ? JSON.parse(saved) : { id: null, username: "", email: "", joinedat: "" };
    });

    const [loggedIn, setLoggedIn] = useState(() => {
        return !!localStorage.getItem('UserData');
    });


    const login = (userData)=>{
        setLoggedIn(true);
        setUserData(userData);
        localStorage.setItem('UserData', JSON.stringify(userData));
    }

    const logout = () => {
        setLoggedIn(false);
        setUserData(undefined);
        localStorage.clear();
    }
    return (
        <AuthedContext1 value={{ UserData,loggedIn, login, logout }}>
            {children}
        </AuthedContext1>
    )

}
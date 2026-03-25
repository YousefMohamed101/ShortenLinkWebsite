import {useState} from 'react';
import {AuthedContext as AuthedContext1} from "./AuthedContext.jsx";


export const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [UserData, setUserData] = useState({id: null,username: "", email: "",joinedat: ""});

    const login = (userData)=>{
        setLoggedIn(true);
        setUserData(userData);
    }

    const logout = () => {
        setLoggedIn(false);
        setUserData({});
    }
    return (
        <AuthedContext1 value={{ UserData,loggedIn, login, logout }}>
            {children}
        </AuthedContext1>
    )

}
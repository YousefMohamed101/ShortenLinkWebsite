import { createContext, useState } from 'react';


export const AuthedContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [UserData, setUserData] = useState({username: "", email: "",joinedat: ""});

    const login = (userData)=>{
        setLoggedIn(true);
        setUserData(userData);
    }

    const logout = () => {
        setLoggedIn(false);
        setUserData({});
    }
    return (
        <AuthedContext.Provider value={{ UserData,loggedIn, login, logout }}>
            {children}
        </AuthedContext.Provider>
    )

}
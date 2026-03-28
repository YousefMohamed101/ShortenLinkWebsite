import { useState } from 'react'
import {createPortal} from "react-dom";
import {createRoot} from "react-dom/client";
import LoginModal from "./LoginModal.jsx";
import './LoginModalcss.css'
import RegisterModal from "./RegisterModal.jsx";

function SignPortal({onClose}) {
    const [view, setView] = useState('login');

    return (

        <>
            {view === "login" && <LoginModal onClose={onClose} onSwap={()=> setView('register')} />}
            {view === "register" && <RegisterModal onClose={onClose} onSwap={()=> setView('login')} />}

        </>



    )


}

export default SignPortal
import {useState} from 'react'
import { createPortal } from 'react-dom';
import './App.css'
import SignPortal from "./Portals/SignPortal.jsx";

function LoginPage() {
    const [showModal, setShowModal] = useState(false)



    return (
        <>
            (<div>

                <center>
                    <h1>Welcome to shorten link</h1>
                </center>
                <center>
                    <button className='MainButton' onClick={()=>setShowModal(true)}>Login/Register</button>
                </center>

            </div>


            <div>
                {showModal && createPortal(<SignPortal onClose={() => setShowModal(false)} />,document.body)}
            </div>
        </>
    )
}

export default LoginPage

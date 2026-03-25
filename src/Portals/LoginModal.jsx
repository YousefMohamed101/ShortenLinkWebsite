import { useState } from 'react'
import {createPortal} from "react-dom";
import {createRoot} from "react-dom/client";
import './LoginModalcss.css'

function LoginModal({onClose,onSwap}) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    return (

       <div className="Container">

               <div className="form">
                   <div className="input-group">
                       <label htmlFor="username">
                           UserName / email
                       </label>
                       <input onChange={e => setUsername(e.target.value)} value={username} placeholder="Username" />
                   </div>

                   <div className="input-group">
                       <label htmlFor="Password">
                           Password
                       </label>
                       <input onChange={e => setPassword(e.target.value)} value={password} placeholder="Password" />
                   </div>


               </div>

           <div className="formButtons">

               <button className="btn-login">login</button>
               <button className="btn-login" onClick={onSwap}>Register</button>
               <button className="btn-quit" onClick={onClose}>quit</button>
           </div>







       </div>

    )


}

export default LoginModal
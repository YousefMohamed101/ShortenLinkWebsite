import {useContext, useState} from 'react'
import './LoginModalcss.css'
import { supabase } from '../utils/supabase.js'


import {AuthedContext} from "../AuthedContext.jsx";

function LoginModal({onClose,onSwap}) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const {login} = useContext(AuthedContext);

    const LoginUser = async (e) => {
        e.preventDefault();
        if (username === '' || password === '') {
            alert('Please enter the missing field');
            return;
        }

        const { data, error } = await supabase.from('Users').select('*').eq('username', username).eq('password', password).single();

        if (error || !data) {
            console.error("Login error:", error);
            alert("Invalid username or password");
            return;
        }

        login({
            id: data.id,
            username: data.username,
            email: data.email,
            joinedat: data.joined_at
        });
        onClose();

        alert("logged in successfully");




        /*const response = await fetch(`http://localhost:5000/server/login/${username}/${password}`);

        const data = await response.json();
        if(response.status === 200) {
            login({id: data.user.id,username:data.user.username,email:data.user.email,joinedat:data.user.joinedat});
            onClose();
        }
        */

    }
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

               <button className="btn-login" onClick={LoginUser}>login</button>
               <button className="btn-login" onClick={onSwap}>Register</button>
               <button className="btn-quit" onClick={onClose}>quit</button>
           </div>







       </div>

    )


}

export default LoginModal
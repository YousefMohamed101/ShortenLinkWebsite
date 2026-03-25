import {useContext, useState} from 'react'
import './LoginModalcss.css'
import {AuthedContext} from "../AuthenticatorGlobal.jsx";

function LoginModal({onClose,onSwap}) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const {user,login} = useContext(AuthedContext);

    const LoginUser = async (e) => {
        e.preventDefault();
        if (username === '' || password === '') {
            alert('Please enter the missing field');
            return;
        }



        const response = await fetch(`http://localhost:5000/server/login/${username}/${password}`);

        const data = await response.json();
        console.log(data);
        if(response.status === 200) {
            login({username:data.user.username,email:data.user.email,joinedat:data.user.joinedat});
            onClose();
            console.log(user);
        }
        console.log(data);
        alert(data.error)

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
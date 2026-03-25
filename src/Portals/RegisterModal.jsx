import { useState } from 'react'
import './LoginModalcss.css'

function RegisterModal({onClose,onSwap}) {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')


    const RegisterUser = async () => {

        if (username === '' || email === '' || password === '') {
            alert('Please enter the missing field');
            return;
        }



        const response = await fetch('http://localhost:5000/server/RegisterUser',{
            method:'POST',
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username: username, email: email, password: password})
        });

        const data = await response.json();
        console.log(data);
        if(response.status === 500 || response.status === 401) {
            alert(data.error)
        }

    }

    return (

        <div className="Container">

            <div className="form">
                <div className="input-group">
                    <label htmlFor="username">
                        UserName
                    </label>
                    <input onChange={e => setUsername(e.target.value)} value={username} placeholder="Username" />
                </div>
                <div className="input-group">
                    <label htmlFor="email">
                        Email
                    </label>
                    <input onChange={e => setEmail(e.target.value)} value={email} placeholder="Email" />
                </div>

                <div className="input-group">
                    <label htmlFor="Password">
                        Password
                    </label>
                    <input onChange={e => setPassword(e.target.value)} value={password} placeholder="Password" />
                </div>


            </div>

            <div className="formButtons">

                <button className="btn-login" onClick={RegisterUser}>Register</button>
                <button className="btn-login" onClick={()=>onSwap("login")}>login</button>
                <button className="btn-quit" onClick={onClose}>quit</button>
            </div>







        </div>

    )


}

export default RegisterModal
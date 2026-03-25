import {useContext} from "react";
import {AuthedContext} from "./AuthenticatorGlobal.jsx";


function UserPage() {
    const {UserData} = useContext(AuthedContext);
    return(
        <div>

            <center>
                <h1>You are Logged in Hi {UserData?.username}</h1>
            </center>
        </div>
    )
}

export default UserPage;
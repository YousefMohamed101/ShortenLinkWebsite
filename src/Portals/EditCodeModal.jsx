import {useContext, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";


function EditCodeModal({link_data,onClose}) {

    const {UserData} = useContext(AuthedContext);

    const [code, setCode] = useState("");

    const editShortCode = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/EditCode`, {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: UserData.id, linkId: link_data.id, code: code})
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Update failed:", data.error);
                return;
            }

            onClose()
        } catch (err) {
            console.error("Network error:", err);
        }
    }

    return (

        <div className = "URLContainer">
            <form className="form" >
                <label> Name:</label>
                <input className="saveUrlField" onChange={e =>setCode(e.target.value)} value={code} placeholder="Enter Your Code" />

            </form>
            <button onClick={editShortCode}>Update</button>
            <button onClick={onClose}>Cancel</button>
        </div>

    )
}

export default EditCodeModal;
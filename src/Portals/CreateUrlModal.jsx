import {useContext, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";
import "./LoginModalcss.css"

function CreateUrlModal({onClose, links}) {

    const {UserData} = useContext(AuthedContext);
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
    const isValidHttpUrl = (string) => {
        let url;
        try {
            url = new URL(string);
            if(url){
                return true;
            }
        } catch {
            return false;
        }
    }
    const Shortlink = async () => {
        if (!name) {
            alert("Please enter a valid name");
            return;
        }
        if (!isValidHttpUrl(url)) {
            alert("Please enter a valid url");
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/server/RegisterLink`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: UserData.id, Name: name, Url: url})
        });

        const data = await response.json();
        console.log(data.data);

        if (!response.ok || !data.data) {
            alert(data.error || "Failed to create link");
            return;     
        }

        links(prevLinks => [...prevLinks, data.data]);
        onClose();
    };

    return (

            <div className = "URLContainer">
                <form className="form" >
                    <label> Name:</label>
                    <input className="saveUrlField" onChange={e =>setName(e.target.value)} value={name} placeholder="Enter Name for the url" />

                    <label> URL:</label>
                    <input className="saveUrlField" onChange={e =>setUrl(e.target.value)} value={url} placeholder="Enter URL to be shorten" />


                </form>
                <button onClick={Shortlink}>Shorten</button>
                <button onClick={onClose}>Cancel</button>
            </div>



    )
}

export default CreateUrlModal;
import {useContext, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";
import "./LoginModalcss.css"

function CreateUrlModal({onClose, links}) {

    const {UserData} = useContext(AuthedContext);
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");

    const Shortlink = async ()=> {

        if(!name){
            alert("Please enter a valid name");
            return;
        }
        if(!url){
            alert("Please enter a valid url");
            return;
        }

        const response =  await fetch("http://localhost:5000/server/RegisterLink", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: UserData.id,Name:name, Url: url})

        })
        const data = await response.json();
        console.log(data);


        links(prevLinks => [...prevLinks,data.link]);

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
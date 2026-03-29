import {useContext, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";
import "./LoginModalcss.css"
import {supabase} from "../utils/supabase.js";
import Generateshort from "../Scripts/UrlEncoder.js";

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

        /*

        const response =  await fetch("http://localhost:5000/server/RegisterLink", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: UserData.id,Name:name, Url: url})

        })
        const data = await response.json();
        console.log(data);
        */

        const {data, errors} = await supabase.from('Links').insert({user_id:UserData.id,link_name:name,shorten_code:null,Url:url}).select("id");
        console.log(data)
        if(errors){
            alert(errors);
            return;
        }
        const shrt_code = Generateshort(data[0].id);
        await supabase.from('Links').update({shorten_code:shrt_code}).eq('id',data[0].id)
        //links(prevLinks => [...prevLinks,data.link]);

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
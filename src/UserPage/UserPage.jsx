import {useContext, useEffect, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";
import "./UserPagecCss.css"


function UserPage() {
    const {UserData,logout} = useContext(AuthedContext);
    const [url, setUrl] = useState("");
    const [LinksData, setLinksData] = useState([{}]);



    const Shortlink = async ()=> {

       const response =  await fetch("http://localhost:5000/server/RegisterLink", {
           method: "POST",
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({id: UserData.id, Url: url})

       })
        const data = await response.json();
       console.log(data);


       setLinksData(prevLinks => [...prevLinks,data.link]);

    };

    const SignOut = () => {
        logout();
    }


    useEffect(() => {
            const Links = async ()=>{

                const response =  await fetch(`http://localhost:5000/server/GetLinks/${UserData.id}`);
                const data = await response.json();
                console.log(data);
                setLinksData(data);

            }
            Links();
        },
        [UserData?.id])

    const VisitLink = (siteCode) => {
        window.open(`http://localhost:5000/${siteCode}`);
    }


    return(
        <div>

            <div className="PageContainer">
                <h1>You are Logged in HI {UserData?.username}</h1>
                <section className="UrlField">
                    <input onChange={e =>setUrl(e.target.value)} value={url} placeholder="Enter URL to be shorten" />
                </section>
                    <button className="SubmitButton" onClick={Shortlink}>Shorten link</button>
                <div className="LinksContainer">

                    <li>
                        {LinksData.map(link => <button className="LinkButton" key={link.id} onClick={()=>VisitLink(link.ShortenCode)} >{link.Url}</button>)}
                    </li>


                </div>

            </div>


            <button className="SignoutButton" onClick={SignOut}>Sign out</button>
        </div>
    )
}

export default UserPage;
import {useContext, useEffect, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";
import "./UserPagecCss.css"
import {createPortal} from "react-dom";
import CreateUrlModal from "../Portals/CreateUrlModal.jsx";
import ShowLinkData from "./ShowLinkData.jsx";


function UserPage() {
    const {UserData,logout} = useContext(AuthedContext);
    const [LinksData, setLinksData] = useState([{}]);
    const [saveUrl, setSaveUrl] = useState(false);
    const [viewLinkData, setViewLinkData] = useState(false);



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
                    <button className="SubmitButton" onClick={()=>setSaveUrl(true)}>Shorten link</button>
                <div className="LinksContainer">
                    {viewLinkData &&(<ShowLinkData onClose={()=>setViewLinkData(false)} />)}

                    {!viewLinkData &&(
                        <li>
                        {LinksData.map(link => <button className="LinkButton" key={link.id} onClick={()=>setViewLinkData(true)} >{link.link_name}</button>)}
                    </li>)}




                </div>

            </div>

            {saveUrl && createPortal(<CreateUrlModal onClose={()=>setSaveUrl(false)} links ={setLinksData} />,document.body)}


            <button className="SignoutButton" onClick={SignOut}>Sign out</button>
        </div>
    )
}

export default UserPage;
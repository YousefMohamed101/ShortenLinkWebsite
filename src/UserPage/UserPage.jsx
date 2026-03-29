import {useContext, useEffect, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";
import "./UserPagecCss.css"
import {createPortal} from "react-dom";
import CreateUrlModal from "../Portals/CreateUrlModal.jsx";
import ShowLinkData from "./ShowLinkData.jsx";

function UserPage() {
    const {UserData,logout} = useContext(AuthedContext);
    const [LinksData, setLinksData] = useState([]);
    const [saveUrl, setSaveUrl] = useState(false);
    const [viewLinkData, setViewLinkData] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);


    const SignOut = () => {
        logout();
    }


    useEffect(() => {
            const Links = async ()=>{

                if (!UserData?.id) return  // guard: don't fetch if id isn't ready
                console.log(UserData.id)
                const response =  await fetch(`${import.meta.env.VITE_API_URL}/server/GetLinks/${UserData.id}`);
                const data = await response.json();
                console.log(data);

                if (!response.ok) {
                    console.error('Failed to fetch links:', data.error)
                    return  // don't call setLinksData with an error object
                }

                setLinksData(data)


            }
            Links();
        },
        [UserData?.id])


    const ShowLink = (linkData) => {
        console.log(linkData);
        setSelectedLink(linkData);
        setViewLinkData(true);
    }


    return(
        <div>

            <div className="PageContainer">
                <h1> HI {UserData?.username}</h1>
                    <button className="SubmitButton" onClick={()=>setSaveUrl(true)}>Shorten link</button>
                <div className="LinksContainer">
                    {viewLinkData &&(<ShowLinkData onClose={()=>setViewLinkData(false)} link_data={selectedLink} link_array={setLinksData}/>)}

                    {!viewLinkData &&(
                        <li>
                        {LinksData.map(link => <button className="LinkButton" key={link.id} onClick={()=>ShowLink(link)} >{link.link_name}</button>)}
                    </li>)}




                </div>

            </div>

            {saveUrl && createPortal(<CreateUrlModal onClose={()=>setSaveUrl(false)} links ={setLinksData} />,document.body)}


            <button className="SignoutButton" onClick={SignOut}>Sign out</button>
        </div>
    )
}

export default UserPage;
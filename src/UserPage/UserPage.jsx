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

                setLinksData(data);
                console.log(LinksData);


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
        <div className="DashboardWrapper">
            <header className="DashboardHeader">
                <div className="HeaderInfo">
                    <span className="WelcomeText">Welcome back, {UserData?.username}</span>

                </div>
                <div className="HeaderActions">
                    <button className="SubmitButton" onClick={() => setSaveUrl(true)}>
                        + Shorten New Link
                    </button>
                    <button className="SignoutButton" onClick={SignOut}>Sign out</button>
                </div>
            </header>

            <main className="MainContent">
                {viewLinkData ? (
                    <div className="AnalyticsView">
                        <ShowLinkData
                            onClose={() => setViewLinkData(false)}
                            link_data={selectedLink}
                            link_array={setLinksData}
                        />
                    </div>
                ) : (
                    <div className="LinksGrid">
                        {LinksData.length > 0 ? (
                            LinksData.map(link => (
                                <div key={link.id} className="LinkCard" onClick={() => ShowLink(link)}>

                                    <h3 className="LinkTitle">{link.link_name}</h3>
                                    <p className="LinkUrl">Click to view analytics</p>
                                    <div className="CardHoverEffect">View Data →</div>
                                </div>
                            ))
                        ) : (
                            <div className="EmptyState">
                                <p>No links found. Create your first one!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {saveUrl && createPortal(
                <CreateUrlModal onClose={() => setSaveUrl(false)} links={setLinksData} />,
                document.body
            )}
        </div>
    )
}

export default UserPage;
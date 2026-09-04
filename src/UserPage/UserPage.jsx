import {useContext, useEffect, useState} from "react";
import {AuthedContext} from "../AuthedContext.jsx";
import "./UserPagecCss.css"
import {createPortal} from "react-dom";
import CreateUrlModal from "../Portals/CreateUrlModal.jsx";
import ShowLinkData from "./ShowLinkData.jsx";
import {CSVLink} from "react-csv";

function UserPage() {
    const {UserData,logout} = useContext(AuthedContext);
    const [LinksData, setLinksData] = useState([]);
    const [saveUrl, setSaveUrl] = useState(false);
    const [viewLinkData, setViewLinkData] = useState(false);
    const [selectedLink, setSelectedLink] = useState(null);


    const SignOut = () => {
        logout();
    }
    const updateLinks = async ()=>{

        if (!UserData?.id) return  // guard: don't fetch if id isn't ready
        console.log(UserData.id)
        const response =  await fetch(`${import.meta.env.VITE_API_URL}/server/GetLinks/${UserData.id}`);
        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            console.error('Failed to fetch links:', data.error)
            return
        }

        setLinksData(data);
        console.log(LinksData);


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
                    return
                }

                setLinksData(data);
                console.log(LinksData);


            }
            Links();
        },
        [ UserData?.id])


    const ShowLink = (linkData) => {
        console.log(linkData);
        setSelectedLink(linkData);
        setViewLinkData(true);
    }

    const csvHeaders = [
        { label: "Link Name", key: "link_name" },
        { label: "Destination URL", key: "Url" },
        { label: "Short Code", key: "shorten_code" },
        { label: "Short URL", key: "short_url" },      // derived field, see below
        { label: "Created At", key: "created_at" },
        { label: "Click Amount", key: "click_amount" },
        { label: "Browsers", key: "browsers" },
        { label: "Clicked From", key: "from" },
        { label: "Countries", key: "countries" },
    ];
    const csvData = (LinksData || []).map(link => ({
        link_name: link.link_name,
        Url: link.Url,
        shorten_code: link.shorten_code,
        short_url: `${import.meta.env.VITE_API_URL}/${link.shorten_code}`,
        created_at: link.created_at ? new Date(link.created_at).toLocaleString() : "",
        click_amount: link.click_amount,
        browsers: link.browsers.join("; "),
        from: link.from.join("; "),
        countries: link.countries.join("; "),

    }));


    return(
        <div className="DashboardWrapper">
            <header className="DashboardHeader">
                <div className="HeaderInfo">
                    <span className="WelcomeText">Welcome back, {UserData?.username}</span>

                </div>
                <div className="HeaderActions">
                    <CSVLink className="SubmitButton" data={csvData} headers={csvHeaders} filename={`shertnlink-export-${new Date().toISOString().slice(0,10)}.csv`} target="_blank"> Export to csv</CSVLink>
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
                            onLinksUpdate={updateLinks}
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
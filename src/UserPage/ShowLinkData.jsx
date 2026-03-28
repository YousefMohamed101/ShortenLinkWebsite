import EChartsReact from "echarts-for-react";
import "./LinkDataCss.css"
import {useEffect, useState} from "react";
function ShowLinkData({onClose,link_data}) {

    const [linkStats, setLinkStats] = useState([{}]);
    useEffect(() => {
        const get_analysis = async () => {
           const response = await fetch(`http://localhost:5000/server/GetLinkAnalysis/${link_data.id}`);
           const data = await response.json();

           setLinkStats(data);
            console.log(data);
        }
        get_analysis();
    },[link_data.id])

    return(
        <>
            <div className="linkDataContainer">
                <button className="linkDataButton" onClick={onClose}>
                    {link_data.link_name}
                </button>
                <div className="dataContainer">
                    <button onClick={()=>window.open(`http://localhost:5000/${link_data.ShortenCode}`)} className="linkDataButton">http://localhost:5000/{link_data.ShortenCode}</button>
                    <label>Total click counts: {linkStats.total}</label>
                </div>

            </div>
        </>
    );

}

export default ShowLinkData;

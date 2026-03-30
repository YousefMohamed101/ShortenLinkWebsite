import EChartsReact from "echarts-for-react";
import "./LinkDataCss.css"
import {useEffect, useState} from "react";
import clipIcon from "../assets/copy.png"

function ShowLinkData({onClose,link_data,link_array}) {

    const [linkStats, setLinkStats] = useState({
        agent_info: [],
        referrer_info: [],
        country_info: [],
        activity_info: [],
        total: 0
    })
    useEffect(() => {
        const get_analysis = async () => {
           const response = await fetch(`${import.meta.env.VITE_API_URL}/server/GetLinkAnalysis/${link_data.id}`);
           const data = await response.json();

           setLinkStats(data);
            console.log(data);
        }
        get_analysis();
    },[link_data.id])

    const CopyToClipboard = () => {
        console.log("CopyToClipboard ",link_data.shorten_code);
        navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/server/${link_data.shorten_code}`);

    }

    const DeleteUrl = async () => {
        console.log(`DeleteUrl: ${import.meta.env.VITE_API_URL}`)
        await fetch(`${import.meta.env.VITE_API_URL}/server/Deletelink/${link_data.id}`,{method:"DELETE"});
        link_array(prevlinks => prevlinks.filter(link=>link.id !== link_data.id));
        onClose();
    }

    const user_agent_chart ={
        series: [
            {
                type: "pie",
                data:

                    (linkStats.agent_info || []).map(item => ({
                        value: item.total_agent,
                        name: item.user_agent || 'Unknown'
                    }))

            }
        ]
    };
    const activity_chart ={
        tooltip: {
            trigger: 'axis', // Shows data for the specific point you hover over
            axisPointer: {
                type: 'none'// Adds a subtle highlight behind the line/bar
            }
        },
        xAxis: {
            type: 'category',
            data: linkStats.activity_info.map(item => item.clicked_at),
            axisLabel: {
                interval: 0,
                rotate: 30 ,
                color: '#fff'
            }

        },
        yAxis: {
            type: 'value'
        },
       series: [{
            data: linkStats.activity_info.map(item => item.total_click),
            type: 'line',
            symbolSize: 8,
            lineStyle: { width: 3, color: '#5470c6' }
        }]

    };

    const country_chart ={
        series: [
            {
                type: "pie",
                data: linkStats.country_info.map(item => ({
                    value: item.total_country,
                    name: item.country_code || 'Unknown'
                }))
            }
        ]
    };
    const referer_chart ={
        series: [
            {
                type: "pie",
                data: linkStats.referrer_info.map(item => ({
                    value: item.total_referrer,
                    name: item.origin || 'Unknown'
                }))
            }
        ]
    };


    return(
        <>
            <div className="linkDataContainer">
                <button className="linkDataButton" onClick={onClose}>
                    {link_data.link_name}
                </button>
                <div className="dataContainer">
                    <div className="shortenLinkContainer">
                        <button onClick={()=>window.open(`${import.meta.env.VITE_API_URL}/server/${link_data.shorten_code}`)} className="linkDataButton">http://localhost:8787/{link_data.shorten_code}</button>
                        <img src={clipIcon} width={32} height={32}  onClick={CopyToClipboard} alt="copy"/>
                    </div>
                    <label>Total click counts: {linkStats.total}</label>
                    <EChartsReact option={user_agent_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>
                    <EChartsReact option={activity_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>
                    <EChartsReact option={referer_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>
                    <EChartsReact option={country_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>
                </div>
                <button className="deletButton" onClick={DeleteUrl}>Delete link</button>

            </div>
        </>
    );

}

export default ShowLinkData;

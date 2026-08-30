import EChartsReact from "echarts-for-react";
import "./LinkDataCss.css"
import {useEffect, useState} from "react";
import clipIcon from "../assets/copy.png"
import * as echarts from 'echarts';



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

            setLinkStats({
                agent_info: Object.entries(data.agent_info || {}).map(([user_agent, total_agent]) => ({ user_agent, total_agent })),
                referrer_info: Object.entries(data.referrer_info || {}).map(([origin, total_referrer]) => ({ origin, total_referrer })),
                country_info: Object.entries(data.country_info || {}).map(([country_code, total_country]) => ({ country_code, total_country })),
                activity_info: Object.entries(data.activity_info || {}).map(([clicked_at, total_click]) => ({ clicked_at, total_click })),
                total: data.total ?? 0
            });

            console.log(data);
        }
        get_analysis();
    },[link_data.id])

    const CopyToClipboard = () => {
        console.log("CopyToClipboard ",link_data.ShortenCode);
        navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/${link_data.ShortenCode}`);

    }

    const DeleteUrl = async () => {
        console.log(`DeleteUrl: ${import.meta.env.VITE_API_URL}`)
        await fetch(`${import.meta.env.VITE_API_URL}/server/Deletelink/${link_data.id}`,{method:"DELETE"});
        link_array(prevlinks => prevlinks.filter(link=>link.id !== link_data.id));
        onClose();
    }
    const chartTheme = {
        textStyle: { fontFamily: 'DM Sans, sans-serif', color: '#94a3b8' },
        color: ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'], // Modern SaaS palette
    };

    const user_agent_chart ={
        ...chartTheme,
        tooltip: { trigger: 'item' },
        series: [
            {
                type: "pie",
                data:

                    (Array.isArray(linkStats.agent_info) ? linkStats.agent_info : []).map(item => ({
                        value: item.total_agent,
                        name: item.user_agent || 'Unknown'
                    }))

            }
        ]
    };
    const activity_chart ={
        ...chartTheme,
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15, 20, 35, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#f1f5f9' }
        },
        grid: { top: 20, right: 20, bottom: 40, left: 40 }, // Added padding
        xAxis: {
            type: 'category',
            data: linkStats.activity_info.map(item => {
                // Format the long timestamp to something readable like "Mar 29, 15:16"
                const date = new Date(item.clicked_at);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }),
            axisLine: { lineStyle: { color: '#334155' } },
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } // Subtle grid
        },
        series: [{
            data: linkStats.activity_info.map(item => item.total_click),
            type: 'line',
            smooth: true, // Professional "wave" look
            symbol: 'circle',
            symbolSize: 6,
            areaStyle: { // Faded background under the line
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(129, 140, 248, 0.3)' },
                    { offset: 1, color: 'rgba(129, 140, 248, 0)' }
                ])
            },
            lineStyle: { width: 3, color: '#818cf8' }
        }]

    };

    const country_chart ={
        ...chartTheme,
        tooltip: { trigger: 'item' },
        series: [{
            name: 'Country',
            type: 'pie',
            data: linkStats.country_info.map(item => ({
                value: item.total_country,
                name: item.country_code
            }))
        }]
    };
    const referer_chart ={
        ...chartTheme,
        tooltip: { trigger: 'item' },
        series: [
            {
                type: "pie",
                data: (Array.isArray(linkStats.referrer_info) ? linkStats.referrer_info : []).map(item => ({
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
                        <button onClick={()=>window.open(`${import.meta.env.VITE_API_URL}/${link_data.ShortenCode}`)} className="linkDataButton">http://localhost:5000/{link_data.ShortenCode}</button>
                        <img src={clipIcon} width={32} height={32}  onClick={CopyToClipboard} alt="copy"/>
                    </div>
                    <label>Total click counts: <label style={{ color: 'greenyellow' }}>{linkStats.total}</label></label>
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

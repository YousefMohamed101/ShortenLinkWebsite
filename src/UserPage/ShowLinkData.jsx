import EChartsReact from "echarts-for-react";
import "./LinkDataCss.css"
import {useEffect, useState} from "react";
import clipIcon from "../assets/copy.png"

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

    const CopyToClipboard = () => {
        console.log("CopyToClipboard");
        navigator.clipboard.writeText(`http://localhost:5000/${link_data.ShortenCode}`);

    }

    const user_agent_chart ={
        series: [
            {
                type: "pie",
                data:

                    (linkStats[1] || []).map(item => ({
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
            data: (linkStats[4] || []).map(item => ({
                value: item.clicked_at
            })),
            axisLabel: {
                interval: 0,
                rotate: 30 ,
                color: '#fff'
            }

        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: (linkStats[4] || []).map(item => ({
                    value: item.total_click
                })),
                type: 'line',
                symbolSize: 8,
                label: {
                    show: false
                },
                lineStyle: {
                    width: 3,
                    color: '#5470c6'
                }
            }
        ]


    };
    const country_chart ={
        series: [
            {
                type: "pie",
                data:
                (linkStats[3] || []).map(item => ({
                    value: item.total_country,
                    name: item.country_code || 'Unknown'
                }))
            }
        ]
    };
    const refferrer_chart ={
        series: [
            {
                type: "pie",
                data: (linkStats[2] || []).map(item => ({
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
                        <button onClick={()=>window.open(`http://localhost:5000/${link_data.ShortenCode}`)} className="linkDataButton">http://localhost:5000/{link_data.ShortenCode}</button>
                        <img src={clipIcon} width={32} height={32}  onClick={CopyToClipboard}/>
                    </div>
                    <label>Total click counts: {linkStats.at(0).total}</label>
                    <EChartsReact option={user_agent_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>
                    <EChartsReact option={activity_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>
                    <EChartsReact option={refferrer_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>
                    <EChartsReact option={country_chart} style={{'height':`212px`,'width': `100%`}} opts={{renderer: `svg`}}/>


                </div>

            </div>
        </>
    );

}

export default ShowLinkData;

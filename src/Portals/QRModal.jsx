import './LoginModalcss.css'
import {useState} from "react";
import QRCode from 'react-qr-code';


function QRModal({onClose,url}){

    const [Url, setUrl] = useState(url);

    return (
        <div className= "QRLayout">
            <label className={"QRLabel"}>Link QR</label>
            <QRCode value= {Url} size={256} bgColor="#ffffff" fgColor="#000000" level="H" ></QRCode>
            <button  onClick={onClose}>Close</button>
        </div>
    )


}

export default QRModal
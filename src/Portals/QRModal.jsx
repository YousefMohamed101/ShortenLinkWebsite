import './LoginModalcss.css'

import QRCode from 'react-qr-code';


function QRModal({onClose,url}){


    return (
        <div className= "QRLayout">
            <label className={"QRLabel"}>Link QR</label>
            <QRCode value= {url} size={256} bgColor="#ffffff" fgColor="#000000" level="H" ></QRCode>
            <button  onClick={onClose}>Close</button>
        </div>
    )


}

export default QRModal
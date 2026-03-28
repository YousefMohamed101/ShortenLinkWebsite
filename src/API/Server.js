import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path';
import { fileURLToPath } from 'url';
import Generateshort from "../Scripts/UrlEncoder.js";


// Get the directory name of the current file (Server.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../Databases/ShortLinkDB.sqlite');

const app = express();
const db = Database(dbPath);
console.log("Connecting to database at:", dbPath);
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);
app.post('/server/RegisterUser', (req, res) => {
    const { username,email, password } = req.body;

    if(!username || !password || !email){
        return res.status(400).json({ error: "Missing data" });
    }

    try{
        const query = db.prepare('INSERT INTO Users (username, email, password, joined_at) VALUES (?,?,?,?)');

        query.run(username, email, password,new Date().toISOString());
        res.status(200).json({ message: "User registered successfully!" });
    }catch(err){

        console.error("Database error:", err);
        if (err.message.includes('Users.username')) {
            return res.status(409).json({ error: "That username is already taken. Please choose another." });
        }


        if (err.message.includes('Users.email')) {
            return res.status(409).json({ error: "An account with that email already exists." });
        }
        res.status(500).json({ error: "Failed to register user." });
    }

})

app.get('/server/login/:username/:password', (req, res) => {

    const username = req.params.username;
    const password = req.params.password;
    let query = db.prepare('SELECT * FROM Users WHERE username = ? AND password = ?');
    if(username.toLowerCase().includes('@')){
        query = db.prepare('SELECT * FROM Users WHERE email = ? AND password = ?');
    }
    const user =query.get(username,password);
    try{
    if(!user){
        res.status(401).json({ error: "Invalid username or password." });

    }
    res.status(200).json({
        message: "Login successful!",
        user: user
    });

} catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login." });
}


})

app.post('/server/RegisterLink', (req, res) => {
    const { id,Name,Url} = req.body;

    const query = db.prepare('INSERT INTO Links (user_id, link_name, ShortenCode, Url, created_at) VALUES (?,?,?,?,?)');

    try{
    const info =query.run(id,Name,Url,Url,new Date().toISOString());

    const shortlink = Generateshort(info.lastInsertRowid);

   db.prepare('UPDATE Links SET ShortenCode = ? WHERE id = ?').run(shortlink,info.lastInsertRowid);
    const link =db.prepare('SELECT * FROM Links WHERE id =?').get(info.lastInsertRowid);
    res.status(200).json({message:"successfully added link",link:link});
    }catch (err){
        console.error("Database error:", err);
        res.status(500).json({ error: "An error occurred during register." });
    }


})

app.get('/:shortcode', async (req, res) => {
    const { shortcode } = req.params;

    const user_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.useragent?.browser || `unknown`;
    const referrer = req.get("Referrer") || 'Direct';


    const query = db.prepare('SELECT * FROM Links WHERE ShortenCode = ?').get(shortcode);
    console.log(query);
    const analyse = db.prepare('INSERT INTO ClickAnalytics (link_id, ip_address, country_code, user_agent, origin, clicked_at) VALUES (?,?,?,?,?,?)');


    if(query){

        analyse.run(query.id,user_ip,"eg",user_agent,referrer,new Date().toISOString().split('T')[0]);

        return res.redirect(String(query.Url));
    }else {
        // 3. Not found
        return res.status(404).send("404: Link not found");
    }

})

app.get('/server/GetLinks/:UserId', (req, res) => {
    const { UserId } = req.params;

        const query = db.prepare(`SELECT * FROM Links WHERE user_id=?`).all(UserId);
    if(query){
        return res.json(query);
    }else{
        return res.status(404).send("<h1>404: Link not found</h1>");
    }
})

app.get('/server/GetLinkAnalysis/:LinkId', (req, res) => {

    const { LinkId } = req.params;
    try{
        const total_clicks = db.prepare(`SELECT COUNT(*) AS total FROM ClickAnalytics WHERE link_id=?`).get(LinkId) ;

        const agent_info = db.prepare(`SELECT user_agent, COUNT(user_agent)  AS total_agent FROM ClickAnalytics WHERE link_id=? GROUP BY user_agent`).all(LinkId)
        const referrer_info = db.prepare(`SELECT origin, COUNT(origin)  AS total_referrer FROM ClickAnalytics WHERE link_id=? GROUP BY origin`).all(LinkId)
        const country_info = db.prepare(`SELECT country_code, COUNT(country_code)  AS total_country FROM ClickAnalytics WHERE link_id=? GROUP BY origin`).all(LinkId)
        const activity_info = db.prepare(`SELECT clicked_at, COUNT(clicked_at)  AS total_click FROM ClickAnalytics WHERE link_id=? GROUP BY clicked_at`).all(LinkId)

        return res.json([total_clicks,agent_info,referrer_info,country_info,activity_info]);

    }catch (err){
        console.error("Database error:", err);
        res.status(404).send("not found");

    }



})

app.delete('/server/Deletelink/:LinkId', (req, res) => {
    const {LinkId} =req.params;

    try{
        db.prepare(`DELETE FROM ClickAnalytics WHERE link_id=?`).run(LinkId);
        db.prepare(`DELETE FROM Links WHERE id=?`).run(LinkId);
        return res.status(200).send("deleted successfully")
    }catch (err){
        console.log("Database error:", err);
        res.status(404).send("not found");
    }



})


app.listen(5000);

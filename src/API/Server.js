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
    const { id,Url} = req.body;

    const query = db.prepare('INSERT INTO Links (user_id, link_name, ShortenCode, Url, created_at) VALUES (?,?,?,?,?)');

    try{
    const info =query.run(id,"",Url,Url,new Date().toISOString());

    const shortlink = Generateshort(info.lastInsertRowid);

   db.prepare('UPDATE Links SET ShortenCode = ? WHERE id = ?').run(shortlink,info.lastInsertRowid);
    const link =db.prepare('SELECT * FROM Links WHERE id =?').get(info.lastInsertRowid);
    res.status(200).json({message:"successfully added link",link:link});
    }catch (err){
        console.error("Database error:", err);
        res.status(500).json({ error: "An error occurred during register." });
    }


})

app.get('/:shortcode', (req, res) => {
    const { shortcode } = req.params;

    const query = db.prepare('SELECT Url FROM Links WHERE ShortenCode = ?').get(shortcode);



    if(query){
        return res.redirect(String(query.Url));
    }else {
        // 3. Not found
        return res.status(404).send("<h1>404: Link not found</h1>");
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
app.listen(5000);

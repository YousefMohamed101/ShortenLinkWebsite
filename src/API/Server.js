import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path';
import { fileURLToPath } from 'url';

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
        res.status(500).json({ error: "Failed to register user." });
    }

})

app.listen(5000);

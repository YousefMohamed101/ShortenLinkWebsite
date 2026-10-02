import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {hashPassword, verifyPassword} from "../utils/password.js";
import Generateshort from "../Scripts/UrlEncoder.js";

/** @type {Hono<{ Bindings: { DB: any } }>} */
const app = new Hono()

app.use('*', cors({
    origin: [ 'http://localhost:5173',
        'https://shertnlink.pages.dev',],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization','Access-Control-Allow-Origin'],
}))
app.onError((err, c) => {
    console.error('Worker crash:', err.message)
    return c.json({ error: err.message }, 500)
})
app.get('/debug', (c) => {
    return c.json({
        db: c.env.DB ? 'SET' : 'MISSING'
    })
})


app.post('/server/RegisterUser', async (c) => {
    const { username, email, password } = await c.req.json()

    if (!username || !password || !email) {
        return c.json({ error: "Missing data" }, 400)
    }

    const db = c.env.DB

    // Supabase Auth used to store the password; now it's hashed into the Users table
    const passwordHash = await hashPassword(password)

    try {
        await db.prepare('INSERT INTO Users (username, email, password, joined_at) VALUES (?, ?, ?, ?)')
            .bind(username, email, passwordHash, new Date().toISOString())
            .run()
    } catch (err) {
        if (err.message.includes('Users.email')) {
            return c.json({ error: "An account with that email already exists." }, 409)
        }
        if (err.message.includes('Users.username')) {
            return c.json({ error: "That username is already taken. Please choose another." }, 409)
        }
        return c.json({ error: err.message }, 400)
    }

    return c.json({ message: "User registered successfully!" }, 200)
})

app.get('/server/login/:username/:password', async (c) => {
    const username = c.req.param('username')
    const password = c.req.param('password')

    const db = c.env.DB

    // username or email, same as before
    const profile = await db
        .prepare(username.includes('@')
            ? 'SELECT * FROM Users WHERE email = ?'
            : 'SELECT * FROM Users WHERE username = ?')
        .bind(username)
        .first()

    if (!profile || !(await verifyPassword(password, profile.password))) {
        return c.json({ error: "Invalid username or password." }, 401)
    }

    return c.json({
        message: "Login successful!",
        user: {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            joinedat: profile.joined_at ?? null,
        },
    }, 200)
})

app.get('/server/GetLinks/:UserId', async (c) => {
    const UserId = c.req.param('UserId');
    const db = c.env.DB;

    const { results: links } = await db
        .prepare('SELECT * FROM Links WHERE user_id = ?')
        .bind(UserId)
        .all();

    if (!links || links.length === 0) return c.json([], 200);

    const linkIds = links.map(l => l.id);

    // subquery instead of IN (?, ?, ...) because D1 allows max 100 bound parameters per query
    const { results: clicks } = await db
        .prepare(`SELECT link_id, user_agent, origin, country_code
                  FROM ClickAnalytics
                  WHERE link_id IN (SELECT id FROM Links WHERE user_id = ?)`)
        .bind(UserId)
        .all();

    const analyticsById = {};
    for (const id of linkIds) {
        analyticsById[id] = {
            click_amount: 0,
            browsers: new Set(),
            from: new Set(),
            countries: new Set(),
        };
    }

    for (const row of (clicks || [])) {
        const entry = analyticsById[row.link_id];
        if (!entry) {
            console.warn('Orphan click row, no matching link_id:', row.link_id);
            continue;
        }
        entry.click_amount += 1;
        entry.browsers.add(row.user_agent || 'unknown');
        entry.from.add(row.origin || 'Direct');
        entry.countries.add(row.country_code || 'unknown');
    }

    const merged = links.map(link => {
        const analysis = analyticsById[link.id] || {
            click_amount: 0,
            browsers: new Set(),
            from: new Set(),
            countries: new Set(),
        };
        return {
            ...link,
            click_amount: analysis.click_amount,
            browsers: [...analysis.browsers],
            from: [...analysis.from],
            countries: [...analysis.countries],
        };
    });

    return c.json(merged, 200);
})
app.delete('/server/Deletelink/:LinkId',async (c) => {
    const LinkId =c.req.param('LinkId');
    const db = c.env.DB;

    try{
        await db.prepare('DELETE FROM Links WHERE id = ?').bind(LinkId).run();
        return c.json("deleted successfully",200)
    }catch (err){
        console.log("Database error:", err);
        return c.json("Not found",404)
    }
})



app.get('/server/GetLinkAnalysis/:LinkId', async (c) => {

    const LinkId  = c.req.param('LinkId');
    const db = c.env.DB;



    const { results: data } = await db
        .prepare('SELECT user_agent, origin, country_code, clicked_at FROM ClickAnalytics WHERE link_id = ?')
        .bind(LinkId)
        .all();

    if (!data || data.length === 0) {
        return c.json({
            agent_info: [],
            referrer_info: [],
            country_info: [],
            activity_info: [],
            total: 0
        }, 200)
    }

    const groupCount = (field) =>
        data.reduce((acc, row) => {
            const key = row[field] || 'unknown'
            acc[key] = (acc[key] || 0) + 1
            return acc
        }, {})

    const agent_info    = groupCount('user_agent')
    const referrer_info = groupCount('origin')
    const country_info  = groupCount('country_code')
    const activity_info = groupCount('clicked_at')

    return c.json({agent_info, referrer_info, country_info, activity_info, total: data.length}, 200)





})


app.get('/:shortcode', async (c) => {
    const shortcode = c.req.param('shortcode');



    const country_code = c.req.raw.cf?.country ?? 'unknown' ;
    const user_agent = c.req.header('user-agent') ?? 'unknown';

    const origin = c.req.header('referer') ?? 'Direct';
    const db = c.env.DB;


    const data = await db.prepare('SELECT * FROM Links WHERE shorten_code = ?').bind(shortcode).first();
    const link_id = data.id;




    if(data){
        try {
            await db
                .prepare('INSERT INTO ClickAnalytics (link_id, country_code, user_agent, origin) VALUES (?, ?, ?, ?)')
                .bind(link_id, country_code, user_agent, origin)
                .run();
        } catch (error) {
            console.log(error);
        }
        console.log(link_id);
        console.log(data);
        return c.redirect(String(data.Url));
    }else {
        return c.json("not found",404);
    }

})

app.post('/server/RegisterLink', async (c) => {
    const { id,Name,Url} = await c.req.json();
    if (!id || !Name || !Url){
        return c.json({ error: 'Missing data' }, 400);
    }
    const db = c.env.DB;

    const data = await db
        .prepare('INSERT INTO Links (user_id, link_name, Url) VALUES (?, ?, ?) RETURNING *')
        .bind(id, Name, Url)
        .first();


    const shrtCode = Generateshort(data.id);

    await db.prepare('UPDATE Links SET shorten_code = ? WHERE id = ?').bind(shrtCode, data.id).run();

    return  c.json({message:"successfully added link",data},200);




})

app.post('/EditCode', async (c) => {
    const { id,linkId,code} = await c.req.json();
    if (!id || !linkId){
        return c.json({ error: 'Missing data' }, 400);
    }
    const db = c.env.DB;

    await db
        .prepare('UPDATE Links SET shorten_code = ? WHERE id = ? AND user_id = ?')
        .bind(code ?? null, linkId, id)
        .run();

    return  c.json({message:"successfully added edited"},200);




})


export default app
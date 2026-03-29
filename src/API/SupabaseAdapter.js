import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {getSupabase} from "../utils/supabase.js";

const app = new Hono()

app.use('*', cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
}))



app.post('/server/RegisterUser', async (c) => {
    const { username, email, password } = await c.req.json()

    if (!username || !password || !email) {
        return c.json({ error: "Missing data" }, 400)
    }

    const supabase = getSupabase(c.env)
    const { data, error } = await supabase.from('Users').insert([{
        username, email, password
    }]).select()

    if (error) {
        if (error.message.includes('Users_username')) {
            return c.json({ error: "That username is already taken. Please choose another." }, 409)
        }
        if (error.message.includes('Users_email')) {
            return c.json({ error: "An account with that email already exists." }, 409)
        }
        return c.json({ error: error.message }, 400)
    }

    return c.json({ message: `User registered successfully!: ${JSON.stringify(data)}` }, 200)
})

app.get('/server/login/:username/:password', async (c) => {
    const username = c.req.param('username')
    const password = c.req.param('password')
    const loginColumn = username.includes('@') ? 'email' : 'username'

    const supabase = getSupabase(c.env)
    const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq(loginColumn, username)
        .eq('password', password)
        .single()

    if (error) {
        console.error("Login error:", error)
        return c.json({ error: "Invalid username or password." }, 401)
    }

    return c.json({ message: "Login successful!", user: data }, 200)
})

app.get('/server/GetLinks/:UserId', async (c) => {
    const UserId  = c.req.param('UserId');
    const supabase = getSupabase(c.env);

    const {data,error} = await supabase.from('Links').select().eq("user_id", UserId);

    if (error) return c.json({ error: error.message }, 500)

    return c.json(data, 200)  // not c.res.json — just c.json()

})

app.delete('/server/Deletelink/:LinkId',async (c) => {
    const LinkId =c.req.params;
    const supabase = getSupabase(c.env);

    try{
         await supabase.from('Links').delete().eq("id", LinkId);
        return c.json("deleted successfully",200)
    }catch (err){
        console.log("Database error:", err);
        return c.json("Not found",404)
    }
})

//analytics

app.get('/server/GetLinkAnalysis/:LinkId', (c) => {

    const LinkId  = c.req.param('LinkId');
    const supabase = getSupabase(c.env);



    const { data, error }=supabase.from('ClickAnalytics').select('user_agent, origin, country_code, clicked_at').eq('link_id',LinkId);
    if (error) return c.json({ error: error.message }, 500);

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

    const user_ip = c.req.header('cf-connecting-ip') ;
    const country_code = c.req.raw.cf?.country ?? 'unknown' ;
    const user_agent = c.req.header('user-agent') ?? 'unknown';

    const referrer = c.req.header('referer') ?? 'Direct';
    const supabase = getSupabase(c.env);


    const {data, error} = await supabase.from("Links").select().eq("shorten_code",shortcode);
    console.log(data);
    //const analyse = db.prepare('INSERT INTO ClickAnalytics (link_id, ip_address, country_code, user_agent, origin, clicked_at) VALUES (?,?,?,?,?,?)');


    if(data){

        //analyse.run(link.id,user_ip,country_code,user_agent,referrer,new Date().toISOString().split('T')[0]);

        return c.redirect(String(data.Url));
    }else {
        // 3. Not found
        console.log(error);
        return c.json("not found",404);
    }

})


export default app
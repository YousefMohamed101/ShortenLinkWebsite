import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {getSupabase} from "../utils/supabase.js";
import Generateshort from "../Scripts/UrlEncoder.js";

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
        supabase_url: c.env.VITE_SUPABASE_URL ?? 'MISSING',
        supabase_key: c.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? 'SET' : 'MISSING'
    })
})


app.post('/server/RegisterUser', async (c) => {
    const { username, email, password } = await c.req.json()

    if (!username || !password || !email) {
        return c.json({ error: "Missing data" }, 400)
    }

    const supabase = getSupabase(c.env)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
            return c.json({ error: "An account with that email already exists." }, 409)
        }
        return c.json({ error: signUpError.message }, 400)
    }

    const { error: profileError } = await supabase.from('Users').insert([{
        id: signUpData.user.id,
        username,
        email,
        joined_at: new Date().toISOString(),
    }])
    if (profileError) {
        if (profileError.message.includes('Profiles_username')) {
            return c.json({ error: "That username is already taken. Please choose another." }, 409)
        }
        return c.json({ error: profileError.message }, 400)
    }

    return c.json({ message: "User registered successfully!" }, 200)
})

app.get('/server/login/:username/:password', async (c) => {
    const username = c.req.param('username')
    const password = c.req.param('password')

    const supabase = getSupabase(c.env)
    let email = username

    // If they typed a username (not an email), look up the matching email first
    if (!username.includes('@')) {
        const { data: profile, error: profileError } = await supabase
            .from('Profiles')
            .select('email')
            .eq('username', username)
            .single()

        if (profileError || !profile) {
            return c.json({ error: "Invalid username or password." }, 401)
        }
        email = profile.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
        return c.json({ error: "Invalid username or password." }, 401)
    }

    // Fetch the profile row for username/joined_at to match what the frontend expects
    const { data: profile } = await supabase
        .from('Profiles')
        .select('username, email, joined_at')
        .eq('id', data.user.id)
        .single()

    return c.json({
        message: "Login successful!",
        user: {
            id: data.user.id,
            username: profile?.username ?? username,
            email: data.user.email,
            joinedat: profile?.joined_at ?? null,
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
    }, 200)
})

app.get('/server/GetLinks/:UserId', async (c) => {
    const UserId  = c.req.param('UserId');
    const supabase = getSupabase(c.env);

    const {data,error} = await supabase.from('Links').select().eq("user_id", UserId);

    if (error) return c.json({ error: error.message }, 500)

    return c.json(data, 200)  // not c.res.json — just c.json()

})

app.delete('/server/Deletelink/:LinkId',async (c) => {
    const LinkId =c.req.param('LinkId');
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

app.get('/server/GetLinkAnalysis/:LinkId', async (c) => {

    const LinkId  = c.req.param('LinkId');
    const supabase = getSupabase(c.env);



    const { data, error }= await supabase.from('ClickAnalytics').select('user_agent, origin, country_code, clicked_at').eq('link_id',LinkId);
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


app.get('/server/:shortcode', async (c) => {
    const shortcode = c.req.param('shortcode');



    const country_code = c.req.raw.cf?.country ?? 'unknown' ;
    const user_agent = c.req.header('user-agent') ?? 'unknown';

    const origin = c.req.header('referer') ?? 'Direct';
    const supabase = getSupabase(c.env);


    const {data, error} = await supabase.from("Links").select().eq("shorten_code",shortcode).single();
    const link_id = data.id;




    if(data){
        const{error} = await supabase.from('ClickAnalytics').insert([{link_id, country_code, user_agent, origin}]);
        console.log(link_id);
        console.log(data);
        console.log(error);
        return c.redirect(String(data.Url));
    }else {
        console.log(error);
        return c.json("not found",404);
    }

})

app.post('/server/RegisterLink', async (c) => {
    const { id,Name,Url} = await c.req.json();
    if (!id || !Name || !Url){
        return c.json({ error: 'Missing data' }, 400);
    }
    const supabase = getSupabase(c.env);

    const {data,error} = await supabase.from('Links').insert([{user_id:id,link_name:Name,Url:Url}]).select().single();

    if (error) {
        return c.json({error: error.message}, 500)
    }


    const shrtCode = Generateshort(data.id);

    const {error: updateError} = await supabase.from('Links').update([{shorten_code: shrtCode}]).eq('id',data.id);
    if (updateError) {
        return c.json({error: updateError.message}, 500)
    }

   return  c.json({message:"successfully added link",data},200);




})


export default app
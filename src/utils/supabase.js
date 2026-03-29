import { createClient } from '@supabase/supabase-js'

export const getSupabase = (env) => {
    // In Cloudflare, variables are properties of 'env'
    return createClient('https://twpeblpilhycqrpfcfrl.supabase.co', 'sb_publishable_PWEJYilwSucdtIR0U-sF4w_O9eYg4Gc');
};

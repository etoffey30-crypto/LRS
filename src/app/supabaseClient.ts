import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bmvaiennjxlvpiylrwrn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5re0bxopjHf6Yzv1bQ9_ag_AWo0NmUY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

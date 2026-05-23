import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ilalviigaxgqvfylwhyg.supabase.co";

const supabaseKey = "sb_publishable_VMtGd6sp5_BaoMI-bJSbWA_dvc2SLP_";

export const supabase = createClient(supabaseUrl, supabaseKey);
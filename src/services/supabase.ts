import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://brlqdlnbebtmtmyodxgy.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RnlwUsYBPa8mSp0-NKvkuQ_SeU18NNz';

export const supabase = createClient(supabaseUrl, supabaseKey);

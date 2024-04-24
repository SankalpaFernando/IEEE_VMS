
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://kwqkrhuaiaggtiypkwpn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cWtyaHVhaWFnZ3RpeXBrd3BuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTQ4NTI0NSwiZXhwIjoyMDI1MDYxMjQ1fQ.Sl4w_WmYpFyyh1jeVwc_7LNn41aiZP-LwLTu4juSt0Q');

export default supabase;


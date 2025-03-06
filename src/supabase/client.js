
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://wxfnnzxradkltbujhwqh.supabase.co', 
                              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4Zm5uenhyYWRrbHRidWpod3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNzkxODAsImV4cCI6MjA1Njg1NTE4MH0.KPzkPiZvSsccWO2RyRgzZjQZ6vRwnhL-EQOAKV1A9nQ'
                             );

export default supabase;


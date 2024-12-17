import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://btcgepwqrhodfzpqnuup.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2dlcHdxcmhvZGZ6cHFudXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5Mjg1NjgsImV4cCI6MjA0ODUwNDU2OH0.JQMk-biUKTkGzn2ElhKKFSK9tn8x0ufYPlfKQFMZpLo";


export const supabase = createClient(supabaseUrl, supabaseKey);



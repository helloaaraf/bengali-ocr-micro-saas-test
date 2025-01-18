import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqrszyykyikwckdzaxxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcnN6eXlreWlrd2NrZHpheHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1ODY4MDAsImV4cCI6MjAyMTE2MjgwMH0.AhZ172-ewC1gJQs6kXGsZWLKHOeY_B8_P9ZcRyaQx6g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obqotsvrrfzdpgrozjhj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icW90c3ZycmZ6ZHBncm96amhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzM1ODUsImV4cCI6MjA2NjAwOTU4NX0.y4jgeeeQfpwGPtzGAv43Ir0HBSJLvL8LdYmXdK5Fvu0';

export const supabase = createClient(supabaseUrl, supabaseKey);

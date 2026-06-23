// Public Supabase connection config.
//
// The anon key is meant to be public — it ships in the browser bundle of every
// Supabase app. What protects the data is Row Level Security: every policy in
// schema.sql requires `auth.uid() is not null`, so the anon key on its own
// grants no access without a valid login.
//
// Environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)
// override these defaults, so you can point a deployment at a different project
// without touching the code.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nityblxwllyctldygogd.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdHlibHh3bGx5Y3RsZHlnb2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTAyNTYsImV4cCI6MjA5Nzc4NjI1Nn0.ssw1_y1Qvue-wJlRJr92wxc9ZnDqWysnN972Kbk17HE";

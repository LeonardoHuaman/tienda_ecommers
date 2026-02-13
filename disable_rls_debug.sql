-- DISABLE RLS COMPLETELY FOR PRODUCTS (DEBUGGING)
-- Run this to confirm if RLS is the cause of the hanging.

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Also disable for users just in case
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

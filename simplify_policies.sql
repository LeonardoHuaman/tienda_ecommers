-- SIMPLIFY POLICIES TO FIX HANGING
-- This script removes the complex "Admin" checks that are causing the page to hang on refresh.
-- It restores basic functionality so you can see products.

BEGIN;

-- 1. Reset Products Table
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin All Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Select" ON public.products;

-- Create a single, simple policy for EVERYONE (Auth & Anon) to read products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
-- (We are intentionally NOT adding the Admin Write policy yet to ensure reading works)


-- 2. Reset Users Table (Profile)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users view own profile" ON public.users;
DROP POLICY IF EXISTS "Read Own Profile" ON public.users;

-- Create a single, simple policy for users to read their OWN profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users Read Own Profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- (Admins can't view all profiles for a moment, to debug)

COMMIT;

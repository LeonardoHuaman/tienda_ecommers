-- FIX INFINITE RECURSION IN RLS POLICIES (ROBUST VERSION)
-- v2: Handles potential naming variations ("Admins view" vs "Admins can view")

-- 1. Create a secure function to check admin status
-- This function runs with "SECURITY DEFINER" privileges, bypassing RLS to avoid the loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Update Policies for USERS table
-- Drop ALL potential variations of the admin policy name to avoid "already exists" errors
DROP POLICY IF EXISTS "Admins view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can view all" ON public.users;
DROP POLICY IF EXISTS "Admins view all" ON public.users;

-- Re-create with safe function
CREATE POLICY "Admins view all profiles" ON public.users 
FOR SELECT USING (public.is_admin());


-- 3. Update Policies for OTHER tables
-- (Dropping potentially conflicting names just in case)

-- Categories
DROP POLICY IF EXISTS "Admin All Categories" ON public.categories;
DROP POLICY IF EXISTS "Categories are insertable by admins" ON public.categories; 
DROP POLICY IF EXISTS "Categories are updatable by admins" ON public.categories;
DROP POLICY IF EXISTS "Categories are deletable by admins" ON public.categories;

CREATE POLICY "Admin All Categories" ON public.categories 
FOR ALL USING (public.is_admin());

-- Products
DROP POLICY IF EXISTS "Admin All Products" ON public.products;
DROP POLICY IF EXISTS "Products are insertable by admins" ON public.products;
DROP POLICY IF EXISTS "Products are updatable by admins" ON public.products;
DROP POLICY IF EXISTS "Products are deletable by admins" ON public.products;

CREATE POLICY "Admin All Products" ON public.products 
FOR ALL USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Admins view all orders" ON public.orders 
FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update orders" ON public.orders 
FOR UPDATE USING (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Admins view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Admins view all order items" ON public.order_items 
FOR SELECT USING (public.is_admin());

-- Settings
DROP POLICY IF EXISTS "Admin Update Settings" ON public.settings;
DROP POLICY IF EXISTS "Settings are updatable by admins" ON public.settings;

CREATE POLICY "Admin Update Settings" ON public.settings 
FOR UPDATE USING (public.is_admin());

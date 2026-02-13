-- MASTER SETUP FOR RC BEAUTY E-COMMERCE
-- This script contains the complete database schema, security policies, storage configuration, and seed data.
-- Run this script in the Supabase SQL Editor.
-- NOTE: THIS SCRIPT WILL RESET ALL DATA.

-- ==========================================
-- 0. CLEANUP
-- ==========================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop triggers
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table);
    END LOOP;

    -- Drop functions
    DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
    DROP FUNCTION IF EXISTS public.update_product_rating CASCADE;
    DROP FUNCTION IF EXISTS public.decrement_product_stock CASCADE;
    DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
    DROP FUNCTION IF EXISTS public.is_admin CASCADE;
    DROP FUNCTION IF EXISTS public.get_user_role CASCADE;

    -- Drop tables
    DROP TABLE IF EXISTS public.reviews CASCADE;
    DROP TABLE IF EXISTS public.favorites CASCADE;
    DROP TABLE IF EXISTS public.order_items CASCADE;
    DROP TABLE IF EXISTS public.orders CASCADE;
    DROP TABLE IF EXISTS public.addresses CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;
    DROP TABLE IF EXISTS public.products CASCADE;
    DROP TABLE IF EXISTS public.categories CASCADE;
    DROP TABLE IF EXISTS public.settings CASCADE;

    -- Drop types
    DROP TYPE IF EXISTS public.user_role CASCADE;
    DROP TYPE IF EXISTS public.brand_type CASCADE;
    DROP TYPE IF EXISTS public.order_status CASCADE;
END $$;

-- ==========================================
-- 1. EXTENSIONS & TYPES
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TYPE public.user_role AS ENUM ('admin', 'customer');
CREATE TYPE public.brand_type AS ENUM ('Esika', 'Unique', 'Avon', 'Natura', 'Cyzone', 'Yanbal');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- ==========================================
-- 2. TABLES
-- ==========================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100),
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand public.brand_type NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    image TEXT NOT NULL,
    images TEXT[],
    description TEXT NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_offer BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role public.user_role DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    department TEXT DEFAULT 'Lima' NOT NULL,
    province TEXT DEFAULT 'Lima' NOT NULL,
    district TEXT NOT NULL,
    street_type TEXT NOT NULL,
    street_name TEXT NOT NULL,
    number TEXT NOT NULL,
    interior TEXT,
    reference TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status public.order_status DEFAULT 'pending',
    shipping_address TEXT NOT NULL, -- Stored as stringified JSON for history
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

CREATE TABLE public.settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

-- 3.0 Check Admin Status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.1 Get User Role RPC
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::TEXT
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 Handle New User Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.3 Update Product Rating
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    reviews = (SELECT COUNT(*) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- 3.4 Decrement Product Stock
CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id_input UUID, quantity_input INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - quantity_input
  WHERE id = product_id_input
  AND stock >= quantity_input;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id_input;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3.5 Update Updated_At Timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4.1 CATEGORIES & PRODUCTS
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin All Categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin All Products" ON public.products FOR ALL USING (public.is_admin());

-- 4.2 USERS
CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public read reviews profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Admins view all profiles" ON public.users FOR SELECT USING (public.is_admin());

-- 4.3 ADDRESSES
CREATE POLICY "Users view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- 4.4 ORDERS
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- 4.5 ORDER ITEMS
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT USING (public.is_admin());

-- 4.6 FAVORITES
CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 4.7 REVIEWS
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- 4.8 SETTINGS
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin Update Settings" ON public.settings FOR UPDATE USING (public.is_admin());

-- ==========================================
-- 5. STORAGE CONFIGURATION
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Public Access
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

-- Policy: Auth Upload (Admin/Auth)
DROP POLICY IF EXISTS "Auth Upload Products" ON storage.objects;
CREATE POLICY "Auth Upload Products" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Policy: Auth Update
DROP POLICY IF EXISTS "Auth Update Products" ON storage.objects;
CREATE POLICY "Auth Update Products" ON storage.objects FOR UPDATE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Policy: Auth Delete
DROP POLICY IF EXISTS "Auth Delete Products" ON storage.objects;
CREATE POLICY "Auth Delete Products" ON storage.objects FOR DELETE USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- ==========================================
-- 6. SEED DATA
-- ==========================================

-- Categories
INSERT INTO public.categories (name, description) VALUES
('Perfumes', 'Fragancias exclusivas y duraderas para toda ocasión'),
('Maquillaje', 'Resalta tu belleza con los mejores cosméticos'),
('Cuidado Facial', 'Tratamientos, cremas y protección para tu rostro'),
('Cuidado Corporal', 'Hidratación y cuidado para todo tu cuerpo')
ON CONFLICT (name) DO NOTHING;

-- Initial Settings
INSERT INTO public.settings (key, value)
VALUES ('shipping_config', '{"free_shipping_threshold": 100, "shipping_cost": 5}')
ON CONFLICT (key) DO NOTHING;

-- Sample Products
INSERT INTO public.products (name, brand, category_id, price, original_price, image, description, is_new, is_offer, stock) VALUES
(
  'Kaiak Clásico Femenino 100ml', 
  'Natura', 
  (SELECT id FROM public.categories WHERE name = 'Perfumes'), 
  119.90, 
  160.00, 
  'https://images.unsplash.com/photo-1523293188086-b43295875438?auto=format&fit=crop&q=80&w=1000', 
  'La explosión cítrica de bergamota y naranja, con la feminidad del jazmín. Un clásico vibrante para la mujer activa.', 
  false, 
  true, 
  25
),
(
  'Pulpa Hidratante para Manos Ekos Castaña', 
  'Natura', 
  (SELECT id FROM public.categories WHERE name = 'Cuidado Corporal'), 
  39.90, 
  55.00, 
  'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=1000', 
  'Hidratación restauradora inmediata con aceite de castaña. Rico en omega-6 y omega-9, nutre hasta las capas más profundas de la piel.', 
  false, 
  true, 
  50
),
(
  'Mascara Mega Full Size', 
  'Esika', 
  (SELECT id FROM public.categories WHERE name = 'Maquillaje'), 
  32.90, 
  48.00, 
  'https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?auto=format&fit=crop&q=80&w=1000', 
  'Efecto largo extremo al instante. Pestañas visiblemente más largas y ligeras con su fórmula gel libre de grumos.', 
  true, 
  true, 
  100
),
(
  'Labial Colorfix 24 Horas - Pimienta Caliente', 
  'Esika', 
  (SELECT id FROM public.categories WHERE name = 'Maquillaje'), 
  28.90, 
  42.00, 
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=1000', 
  'Color intenso que no transfiere y dura todo el día. Acabado mate confortable que no reseca tus labios.', 
  true, 
  false, 
  80
),
(
  'Total Block SPF 100', 
  'Unique', 
  (SELECT id FROM public.categories WHERE name = 'Cuidado Facial'), 
  55.00, 
  95.00, 
  'https://images.unsplash.com/photo-1556228578-8d894c48971d?auto=format&fit=crop&q=80&w=1000', 
  'Protector solar de muy alta protección contra rayos UVB, UVA y luz azul. Textura ligera y sin brillo.', 
  false, 
  true, 
  40
),
(
  'Perfume Ccori Cristal', 
  'Unique', 
  (SELECT id FROM public.categories WHERE name = 'Perfumes'), 
  145.00, 
  210.00, 
  'https://images.unsplash.com/photo-1594035910387-fea477942698?auto=format&fit=crop&q=80&w=1000', 
  'Un aroma oriental dulce con notas de vainilla y chocolate. Elegante y moderno para la mujer que brilla con luz propia.', 
  false, 
  false, 
  15
),
(
  'Sweet Black', 
  'Cyzone', 
  (SELECT id FROM public.categories WHERE name = 'Perfumes'), 
  49.90, 
  70.00, 
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000', 
  'Aroma oriental dulce con toques de pinkberry y sándalo. Para chicas audaces que dejan huella.', 
  false, 
  true, 
  60
),
(
  'Labial Studio Look Mate - Deep Red', 
  'Cyzone', 
  (SELECT id FROM public.categories WHERE name = 'Maquillaje'), 
  24.90, 
  38.00, 
  'https://images.unsplash.com/photo-1627293500074-ce4606ccdb2d?auto=format&fit=crop&q=80&w=1000', 
  'Color mate de larga duración que no se corre. Textura suave y ligera para un look de impacto todo el día.', 
  true, 
  false, 
  120
),
(
  'Anew Reversalist Crema de Día', 
  'Avon', 
  (SELECT id FROM public.categories WHERE name = 'Cuidado Facial'), 
  59.90, 
  85.00, 
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=1000', 
  'Crema facial antiarrugas con Protinol. Ayuda a revitalizar la piel y reducir visiblemente las líneas de expresión en 48 horas.', 
  true, 
  true, 
  30
),
(
  'Far Away Original', 
  'Avon', 
  (SELECT id FROM public.categories WHERE name = 'Perfumes'), 
  65.00, 
  90.00, 
  'https://images.unsplash.com/photo-1588405764423-28138549ad60?auto=format&fit=crop&q=80&w=1000', 
  'Una escapada a lo exótico con notas de fresia, jazmín y almizcle de vainilla. Un clásico perdurable.', 
  false, 
  false, 
  45
);

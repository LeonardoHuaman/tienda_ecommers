-- 1. Primero aseguramos que existan las categorías
INSERT INTO public.categories (name, description) VALUES
('Perfumes', 'Fragancias exclusivas y duraderas para toda ocasión'),
('Maquillaje', 'Resalta tu belleza con los mejores cosméticos'),
('Cuidado Facial', 'Tratamientos, cremas y protección para tu rostro'),
('Cuidado Corporal', 'Hidratación y cuidado para todo tu cuerpo')
ON CONFLICT (name) DO NOTHING;

-- 2. Insertamos 10 productos de prueba variados para Lima, Perú
INSERT INTO public.products (name, brand, category_id, price, original_price, image, description, is_new, is_offer, stock) VALUES
-- Natura
(
  'Kaiak Clásico Femenino 100ml', 
  'Natura', 
  (SELECT id FROM categories WHERE name = 'Perfumes'), 
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
  (SELECT id FROM categories WHERE name = 'Cuidado Corporal'), 
  39.90, 
  55.00, 
  'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=1000', 
  'Hidratación restauradora inmediata con aceite de castaña. Rico en omega-6 y omega-9, nutre hasta las capas más profundas de la piel.', 
  false, 
  true, 
  50
),

-- Esika
(
  'Mascara Mega Full Size', 
  'Esika', 
  (SELECT id FROM categories WHERE name = 'Maquillaje'), 
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
  (SELECT id FROM categories WHERE name = 'Maquillaje'), 
  28.90, 
  42.00, 
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=1000', 
  'Color intenso que no transfiere y dura todo el día. Acabado mate confortable que no reseca tus labios.', 
  true, 
  false, 
  80
),

-- Unique / Yanbal
(
  'Total Block SPF 100', 
  'Unique', 
  (SELECT id FROM categories WHERE name = 'Cuidado Facial'), 
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
  (SELECT id FROM categories WHERE name = 'Perfumes'), 
  145.00, 
  210.00, 
  'https://images.unsplash.com/photo-1594035910387-fea477942698?auto=format&fit=crop&q=80&w=1000', 
  'Un aroma oriental dulce con notas de vainilla y chocolate. Elegante y moderno para la mujer que brilla con luz propia.', 
  false, 
  false, 
  15
),

-- Cyzone
(
  'Sweet Black', 
  'Cyzone', 
  (SELECT id FROM categories WHERE name = 'Perfumes'), 
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
  (SELECT id FROM categories WHERE name = 'Maquillaje'), 
  24.90, 
  38.00, 
  'https://images.unsplash.com/photo-1627293500074-ce4606ccdb2d?auto=format&fit=crop&q=80&w=1000', 
  'Color mate de larga duración que no se corre. Textura suave y ligera para un look de impacto todo el día.', 
  true, 
  false, 
  120
),

-- Avon
(
  'Anew Reversalist Crema de Día', 
  'Avon', 
  (SELECT id FROM categories WHERE name = 'Cuidado Facial'), 
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
  (SELECT id FROM categories WHERE name = 'Perfumes'), 
  65.00, 
  90.00, 
  'https://images.unsplash.com/photo-1588405764423-28138549ad60?auto=format&fit=crop&q=80&w=1000', 
  'Una escapada a lo exótico con notas de fresia, jazmín y almizcle de vainilla. Un clásico perdurable.', 
  false, 
  false, 
  45
);

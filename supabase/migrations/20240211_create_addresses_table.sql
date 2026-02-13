-- Tabla de Direcciones (Addresses)
-- Pensada para escalar: permite múltiples direcciones por usuario y campos detallados para Lima.

create table if not exists public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  department text default 'Lima' not null,
  province text default 'Lima' not null,
  district text not null,
  street_type text not null, -- Av., Calle, Jr., etc.
  street_name text not null,
  number text not null,
  interior text, -- Opcional
  reference text not null,
  coordinates point, -- Para futuras integraciones con mapas reales
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar seguridad (RLS)
alter table public.addresses enable row level security;

-- Políticas de seguridad (Solo el dueño puede ver/editar sus direcciones)
create policy "Users can view their own addresses"
on public.addresses for select
using (auth.uid() = user_id);

create policy "Users can insert their own addresses"
on public.addresses for insert
with check (auth.uid() = user_id);

create policy "Users can update their own addresses"
on public.addresses for update
using (auth.uid() = user_id);

create policy "Users can delete their own addresses"
on public.addresses for delete
using (auth.uid() = user_id);

-- Índices para búsqueda rápida (Opcional pero recomendado para futuro)
create index addresses_user_id_idx on public.addresses(user_id);
create index addresses_district_idx on public.addresses(district);

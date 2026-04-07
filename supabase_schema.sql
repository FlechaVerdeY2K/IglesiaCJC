-- ============================================================
-- Supabase SQL Schema — Iglesia CJC App
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor → New Query
-- ============================================================

-- 0. Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- TABLAS
-- ────────────────────────────────────────────────────────────

-- Usuarios (vinculados a auth.users)
create table if not exists public.usuarios (
  id            uuid primary key references auth.users(id) on delete cascade,
  nombre        text not null default '',
  email         text not null default '',
  foto_url      text default '',
  rol           text not null default 'miembro',  -- 'miembro' | 'admin'
  creado_en     timestamptz default now()
);

-- Anuncios
create table if not exists public.anuncios (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null default '',
  descripcion text not null default '',
  imagen_url  text default '',
  fecha       timestamptz default now(),
  activo      boolean default true
);

-- Sermones
create table if not exists public.sermones (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null default '',
  descripcion text not null default '',
  video_id    text not null default '',
  predicador  text not null default '',
  fecha       timestamptz default now(),
  activo      boolean default true
);

-- Devocionales
create table if not exists public.devocionales (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null default '',
  versiculo   text not null default '',
  referencia  text not null default '',
  reflexion   text not null default '',
  fecha       timestamptz default now()
);

-- Oraciones
create table if not exists public.oraciones (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null default '',
  peticion     text not null default '',
  anonima      boolean default false,
  fecha        timestamptz default now(),
  estado       text not null default 'pendiente',  -- 'pendiente' | 'aprobada' | 'rechazada'
  orantes      integer default 0,
  orantes_uids text[] default '{}',
  autor_uid    uuid references auth.users(id) on delete set null
);

-- Galería
create table if not exists public.galeria (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null default '',
  titulo      text not null default '',
  descripcion text not null default '',
  fecha       timestamptz default now(),
  categoria   text not null default 'general'
);

-- Recursos
create table if not exists public.recursos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null default '',
  descripcion text not null default '',
  url         text not null default '',
  tipo        text not null default 'pdf',  -- 'pdf' | 'audio' | 'video'
  fecha       timestamptz default now()
);

-- Pastores
create table if not exists public.pastores (
  id       uuid primary key default gen_random_uuid(),
  nombre   text not null default '',
  cargo    text not null default '',
  bio      text not null default '',
  foto_url text,
  orden    integer default 0
);

-- Equipos
create table if not exists public.equipos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null default '',
  descripcion text not null default '',
  lider       text not null default '',
  icon_name   text,
  orden       integer default 0
);

-- Eventos
create table if not exists public.eventos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null default '',
  descripcion text not null default '',
  fecha       timestamptz default now(),
  lugar       text,
  image_url   text,
  activo      boolean default true
);

-- Configuración Home (singleton — solo 1 fila con id=1)
create table if not exists public.config_home (
  id                integer primary key default 1 check (id = 1),
  bienvenida_titulo text default 'Bienvenidos a Iglesia CJC',
  bienvenida_texto  text default '',
  servicios_texto   text default '',
  telefono          text default '',
  waze_url          text default '',
  youtube_url       text default '',
  instagram_url     text default '',
  facebook_url      text default ''
);

-- Configuración Live (singleton — solo 1 fila con id=1)
create table if not exists public.config_live (
  id          integer primary key default 1 check (id = 1),
  video_id    text default '',
  titulo      text default '',
  descripcion text default '',
  activo      boolean default false
);

-- GPS Registros
create table if not exists public.gps_registros (
  id    uuid primary key default gen_random_uuid(),
  datos jsonb default '{}',
  fecha timestamptz default now()
);

-- GPS Solicitudes
create table if not exists public.gps_solicitudes (
  id    uuid primary key default gen_random_uuid(),
  datos jsonb default '{}',
  fecha timestamptz default now()
);

-- Registros de Eventos
create table if not exists public.registros_eventos (
  id    uuid primary key default gen_random_uuid(),
  datos jsonb default '{}',
  fecha timestamptz default now()
);


-- ────────────────────────────────────────────────────────────
-- HABILITAR REALTIME (para streams en la app)
-- ────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.anuncios;
alter publication supabase_realtime add table public.sermones;
alter publication supabase_realtime add table public.devocionales;
alter publication supabase_realtime add table public.oraciones;
alter publication supabase_realtime add table public.galeria;
alter publication supabase_realtime add table public.recursos;
alter publication supabase_realtime add table public.pastores;
alter publication supabase_realtime add table public.equipos;
alter publication supabase_realtime add table public.eventos;
alter publication supabase_realtime add table public.config_home;
alter publication supabase_realtime add table public.config_live;


-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Habilitar RLS en todas las tablas
alter table public.usuarios        enable row level security;
alter table public.anuncios        enable row level security;
alter table public.sermones        enable row level security;
alter table public.devocionales    enable row level security;
alter table public.oraciones       enable row level security;
alter table public.galeria         enable row level security;
alter table public.recursos        enable row level security;
alter table public.pastores        enable row level security;
alter table public.equipos         enable row level security;
alter table public.eventos         enable row level security;
alter table public.config_home     enable row level security;
alter table public.config_live     enable row level security;
alter table public.gps_registros   enable row level security;
alter table public.gps_solicitudes enable row level security;
alter table public.registros_eventos enable row level security;

-- ── Políticas de lectura pública ──────────────────────────────────────────────
-- (cualquiera puede leer anuncios, sermones, devocionales, pastores, equipos,
--  galería, recursos, eventos, config)

create policy "Lectura pública" on public.anuncios        for select using (true);
create policy "Lectura pública" on public.sermones        for select using (true);
create policy "Lectura pública" on public.devocionales    for select using (true);
create policy "Lectura pública" on public.pastores        for select using (true);
create policy "Lectura pública" on public.equipos         for select using (true);
create policy "Lectura pública" on public.galeria         for select using (true);
create policy "Lectura pública" on public.recursos        for select using (true);
create policy "Lectura pública" on public.eventos         for select using (true);
create policy "Lectura pública" on public.config_home     for select using (true);
create policy "Lectura pública" on public.config_live     for select using (true);

-- Oraciones aprobadas son públicas; las pendientes solo para autenticados
create policy "Lectura oraciones aprobadas" on public.oraciones
  for select using (
    estado = 'aprobada'
    or auth.uid() = autor_uid
    or exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'admin'
    )
  );

-- ── Políticas de escritura para usuarios autenticados ───────────────────────

create policy "Insert oraciones autenticados" on public.oraciones
  for insert with check (auth.role() = 'authenticated');

create policy "UPDATE oraciones admin" on public.oraciones
  for update using (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'admin'
    )
  );

create policy "Usuarios leen su propio perfil" on public.usuarios
  for select using (auth.uid() = id);

create policy "Usuarios actualizan su propio perfil" on public.usuarios
  for update using (auth.uid() = id);

create policy "Usuarios insertan su propio perfil" on public.usuarios
  for insert with check (auth.uid() = id);

-- GPS: solo usuarios autenticados pueden insertar
create policy "Insert GPS autenticados" on public.gps_registros
  for insert with check (auth.role() = 'authenticated');

create policy "Insert GPS solicitudes autenticados" on public.gps_solicitudes
  for insert with check (auth.role() = 'authenticated');

create policy "Insert registros eventos autenticados" on public.registros_eventos
  for insert with check (auth.role() = 'authenticated');

-- ── Políticas de escritura para admin  ──────────────────────────────────────

create policy "Admin escribe anuncios" on public.anuncios
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe sermones" on public.sermones
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe devocionales" on public.devocionales
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe pastores" on public.pastores
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe equipos" on public.equipos
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe galeria" on public.galeria
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe recursos" on public.recursos
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe eventos" on public.eventos
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe config_home" on public.config_home
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );

create policy "Admin escribe config_live" on public.config_live
  for all using (
    exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'admin')
  );


-- ────────────────────────────────────────────────────────────
-- TRIGGER: crear fila en usuarios cuando llega un nuevo auth.user
-- (alternativa a llamar _saveUserProfile manualmente)
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.usuarios (id, nombre, email, foto_url, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'miembro'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

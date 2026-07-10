import 'dotenv/config'
import { pool } from './pool.js'

const schema = `
create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'candidate',
  created_at timestamptz not null default now()
);

create table if not exists interviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  target_role text not null,
  job_description text default '',
  difficulty text not null default 'intermediate',
  questions jsonb default '[]'::jsonb,
  status text not null default 'scheduled',
  overall_score numeric default 0,
  created_at timestamptz not null default now()
);

create table if not exists interview_answers (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid references interviews(id) on delete cascade,
  question text not null,
  transcript text not null,
  nlp_score numeric default 0,
  cv_score numeric default 0,
  feedback jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid references interviews(id) on delete cascade,
  summary text not null,
  strengths jsonb default '[]'::jsonb,
  risks jsonb default '[]'::jsonb,
  recommendation text not null,
  analysis jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table interviews add column if not exists job_description text default '';
alter table interviews add column if not exists difficulty text not null default 'intermediate';
alter table interviews add column if not exists questions jsonb default '[]'::jsonb;
alter table interviews add column if not exists completed_at timestamptz;
alter table reports add column if not exists analysis jsonb default '{}'::jsonb;
`

await pool.query(schema)
console.log('Database schema is ready.')
await pool.end()

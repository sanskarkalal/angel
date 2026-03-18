-- Angel App — Voice Profile Migration

alter table public.user_profiles
  add column if not exists voice_profile text,
  add column if not exists convo_count integer not null default 0;

comment on column public.user_profiles.voice_profile is 'LLM-generated summary of how this user writes and talks. Updated every 10 conversations.';
comment on column public.user_profiles.convo_count is 'Total number of completed conversations. Used to trigger voice_profile refresh every 10.';

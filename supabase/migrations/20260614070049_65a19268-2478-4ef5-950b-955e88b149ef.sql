
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "Anyone can submit questionnaire" on public.questionnaire_responses;
create policy "Anon submits without user_id" on public.questionnaire_responses
  for insert to anon with check (user_id is null);
create policy "Auth submits as self" on public.questionnaire_responses
  for insert to authenticated with check (user_id is null or user_id = auth.uid());

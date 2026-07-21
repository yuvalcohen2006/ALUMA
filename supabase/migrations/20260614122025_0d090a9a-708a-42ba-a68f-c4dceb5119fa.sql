
DROP POLICY IF EXISTS "Auth submits as self" ON public.questionnaire_responses;
CREATE POLICY "Auth submits as self"
ON public.questionnaire_responses
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

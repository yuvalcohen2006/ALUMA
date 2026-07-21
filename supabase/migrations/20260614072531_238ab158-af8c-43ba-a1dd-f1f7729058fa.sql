-- Prevent authenticated users from submitting questionnaire responses as anonymous (user_id IS NULL).
-- Anonymous (anon) users are still allowed to submit without a user_id; authenticated users must set user_id = auth.uid().
CREATE POLICY "Auth users must own their questionnaire row"
ON public.questionnaire_responses
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());
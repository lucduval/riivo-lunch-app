-- Create a SECURITY DEFINER function to reliably fetch a user's role.
-- This bypasses RLS so the lookup always works, even when JWT email claim
-- is missing or formatted differently across auth providers.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TABLE(role TEXT, user_id UUID) AS $$
DECLARE
  _email TEXT;
BEGIN
  -- Azure/Microsoft OAuth may place the email in user_metadata rather than
  -- the top-level JWT 'email' claim.  Try both locations.
  _email := COALESCE(
    auth.jwt() ->> 'email',
    auth.jwt() -> 'user_metadata' ->> 'email'
  );

  RETURN QUERY
  SELECT ur.role, ur.user_id
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
     OR (_email IS NOT NULL AND LOWER(ur.email) = LOWER(_email))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

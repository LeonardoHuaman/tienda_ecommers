-- CREATE SECURE RPC TO GET USER ROLE
-- This function allows the frontend to get the user's role without triggering complex RLS policies.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  _role text;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN 'customer';
  END IF;

  -- Get role from users table (bypassing RLS due to SECURITY DEFINER)
  SELECT role INTO _role
  FROM public.users
  WHERE id = auth.uid();

  -- Default to 'customer' if no user profile found
  RETURN COALESCE(_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

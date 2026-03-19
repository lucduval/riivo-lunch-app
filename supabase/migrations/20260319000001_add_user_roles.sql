-- User roles table for invite-only access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
  );

-- Users can read their own role (by user_id or email)
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (
    user_id = auth.uid()
    OR LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', auth.jwt() -> 'user_metadata' ->> 'email'))
  );

-- Users can update their own row (for backfilling user_id)
CREATE POLICY "Users can update own role row" ON public.user_roles
  FOR UPDATE USING (
    LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', auth.jwt() -> 'user_metadata' ->> 'email'))
  )
  WITH CHECK (
    LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', auth.jwt() -> 'user_metadata' ->> 'email'))
  );

-- Trigger to link auth.users.id to user_roles.user_id on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_roles
  SET user_id = NEW.id,
      updated_at = NOW()
  WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

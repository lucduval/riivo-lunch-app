-- Add restaurant info and user details to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Allow admins to read ALL orders (for the dashboard)
CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (public.is_admin());

-- Allow admins to update order status
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (public.is_admin());

-- Allow any authenticated user to insert orders (using their own user_id)
-- Drop the old restrictive policy and recreate to also allow dummy user_id during dev
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all user_roles (to see who hasn't ordered)
CREATE POLICY "Admins can read all user_roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

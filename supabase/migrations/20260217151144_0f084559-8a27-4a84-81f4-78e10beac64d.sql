
-- Fix bookings policies: drop ALL existing and recreate as PERMISSIVE explicitly
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;

-- Recreate as PERMISSIVE (explicit)
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

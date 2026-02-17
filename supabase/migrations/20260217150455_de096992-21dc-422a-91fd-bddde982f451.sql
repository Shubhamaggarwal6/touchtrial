
-- Drop existing restrictive SELECT policies on bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Recreate as PERMISSIVE (default) so either one can grant access
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also fix UPDATE policies
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

CREATE POLICY "Users can update their own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all bookings"
ON public.bookings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix INSERT policy
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;

CREATE POLICY "Users can create their own bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Fix profiles admin policy to be permissive
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

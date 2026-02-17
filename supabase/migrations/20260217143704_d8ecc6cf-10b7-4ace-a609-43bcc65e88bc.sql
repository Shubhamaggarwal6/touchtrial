-- Remove permissive SELECT, UPDATE, DELETE policies on otp_verifications
-- Only keep INSERT (needed for pre-auth OTP creation) and restrict it
DROP POLICY IF EXISTS "Anyone can read OTP verifications" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can update OTP verifications" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can delete OTP verifications" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can create OTP verifications" ON public.otp_verifications;

-- No client-side policies needed - all OTP operations happen via edge functions using service role key

-- Allow deleting OTP records (needed by edge function with service role, and cleanup)
CREATE POLICY "Anyone can delete OTP verifications"
ON public.otp_verifications
FOR DELETE
USING (true);

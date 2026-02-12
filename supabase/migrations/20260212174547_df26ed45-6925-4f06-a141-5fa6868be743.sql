
-- Create OTP verifications table
CREATE TABLE public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts/reads for OTP verification (pre-auth)
CREATE POLICY "Anyone can create OTP verifications"
ON public.otp_verifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read OTP verifications"
ON public.otp_verifications
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update OTP verifications"
ON public.otp_verifications
FOR UPDATE
USING (true);

-- Auto-cleanup expired OTPs (optional index for performance)
CREATE INDEX idx_otp_phone_expires ON public.otp_verifications (phone, expires_at);

-- Add phone_verified column to profiles
ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT false;

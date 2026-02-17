
-- Add columns to store selected variant and color for each phone in a booking
ALTER TABLE public.bookings
ADD COLUMN phone_variants text[] DEFAULT '{}',
ADD COLUMN phone_colors text[] DEFAULT '{}';

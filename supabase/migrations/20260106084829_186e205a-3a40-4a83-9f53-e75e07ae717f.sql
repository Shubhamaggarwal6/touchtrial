-- Add time_slot and delivery_date columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN time_slot text,
ADD COLUMN delivery_date date;
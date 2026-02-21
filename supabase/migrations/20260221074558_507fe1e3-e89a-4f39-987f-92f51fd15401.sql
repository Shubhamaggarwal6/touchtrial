
-- Create coupons table for admin-managed coupon codes
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_amount integer NOT NULL DEFAULT 0,
  max_uses integer NOT NULL DEFAULT 1,
  current_uses integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  first_order_only boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (needed for validation)
CREATE POLICY "Anyone can view active coupons"
ON public.coupons FOR SELECT
USING (is_active = true);

-- Admins can view all coupons
CREATE POLICY "Admins can view all coupons"
ON public.coupons FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert coupons
CREATE POLICY "Admins can insert coupons"
ON public.coupons FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update coupons
CREATE POLICY "Admins can update coupons"
ON public.coupons FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete coupons
CREATE POLICY "Admins can delete coupons"
ON public.coupons FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default FIRST200 coupon
INSERT INTO public.coupons (code, discount_amount, max_uses, current_uses, is_active, first_order_only)
VALUES ('FIRST200', 200, 9999, 0, true, true);

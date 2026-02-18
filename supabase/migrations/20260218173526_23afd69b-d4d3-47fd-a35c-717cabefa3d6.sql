
-- Create phones table with full schema
CREATE TABLE public.phones (
  id TEXT NOT NULL PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  ram TEXT NOT NULL DEFAULT '',
  storage TEXT NOT NULL DEFAULT '',
  os TEXT NOT NULL DEFAULT 'Android',
  display TEXT NOT NULL DEFAULT '',
  processor TEXT NOT NULL DEFAULT '',
  camera TEXT NOT NULL DEFAULT '',
  battery TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  gallery TEXT[] NOT NULL DEFAULT '{}',
  variants JSONB NOT NULL DEFAULT '[]',
  colors JSONB NOT NULL DEFAULT '[]',
  bank_offers JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phones ENABLE ROW LEVEL SECURITY;

-- Anyone can view active phones
CREATE POLICY "Anyone can view active phones"
ON public.phones
FOR SELECT
USING (is_active = true);

-- Admins can view all phones
CREATE POLICY "Admins can view all phones"
ON public.phones
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert
CREATE POLICY "Admins can insert phones"
ON public.phones
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update phones"
ON public.phones
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete phones"
ON public.phones
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_phones_updated_at
BEFORE UPDATE ON public.phones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

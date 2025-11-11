-- Fix security warning: Set search_path for function
CREATE OR REPLACE FUNCTION public.cleanup_expired_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.access_records
  WHERE expires_at < now();
END;
$$;
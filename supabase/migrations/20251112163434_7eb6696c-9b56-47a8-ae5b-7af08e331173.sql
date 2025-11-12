-- Create function to increment service usage stats
CREATE OR REPLACE FUNCTION public.increment_service_usage(
  p_wallet_address text,
  p_service_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update leaderboard stats
  INSERT INTO public.leaderboard_stats (
    wallet_address,
    services_used,
    last_payment_at
  )
  VALUES (
    p_wallet_address,
    1,
    now()
  )
  ON CONFLICT (wallet_address)
  DO UPDATE SET
    services_used = leaderboard_stats.services_used + 1,
    last_payment_at = now();
END;
$$;
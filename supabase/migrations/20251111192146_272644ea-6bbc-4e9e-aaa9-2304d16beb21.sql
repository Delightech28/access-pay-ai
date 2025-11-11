-- Create access_records table to track timed access
CREATE TABLE IF NOT EXISTS public.access_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(wallet_address, service_id)
);

-- Create index for efficient queries
CREATE INDEX idx_access_records_wallet ON public.access_records(wallet_address);
CREATE INDEX idx_access_records_expires ON public.access_records(expires_at);

-- Create leaderboard_stats table
CREATE TABLE IF NOT EXISTS public.leaderboard_stats (
  wallet_address TEXT PRIMARY KEY,
  total_spent NUMERIC(20, 6) DEFAULT 0,
  services_used INTEGER DEFAULT 0,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for leaderboard queries
CREATE INDEX idx_leaderboard_total_spent ON public.leaderboard_stats(total_spent DESC);

-- Function to clean up expired access records
CREATE OR REPLACE FUNCTION public.cleanup_expired_access()
RETURNS void AS $$
BEGIN
  DELETE FROM public.access_records
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.access_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access (no auth needed for this hackathon project)
CREATE POLICY "Allow public read access to access_records"
  ON public.access_records
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to access_records"
  ON public.access_records
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to access_records"
  ON public.access_records
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to leaderboard_stats"
  ON public.leaderboard_stats
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to leaderboard_stats"
  ON public.leaderboard_stats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to leaderboard_stats"
  ON public.leaderboard_stats
  FOR UPDATE
  USING (true);
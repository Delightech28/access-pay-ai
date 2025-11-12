import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const walletAddress = url.searchParams.get('walletAddress');
    const serviceId = url.searchParams.get('serviceId');

    if (!walletAddress || !serviceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check if access exists and is not expired
    const { data: accessRecord, error } = await supabase
      .from('access_records')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('service_id', parseInt(serviceId))
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking access:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to check access' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!accessRecord) {
      return new Response(
        JSON.stringify({ hasAccess: false, expired: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    const expiresAt = new Date(accessRecord.expires_at);
    const now = new Date();
    const hasAccess = expiresAt > now;

    return new Response(
      JSON.stringify({ 
        hasAccess,
        expired: !hasAccess,
        expiresAt: accessRecord.expires_at 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-access function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

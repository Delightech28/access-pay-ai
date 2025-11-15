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
    const { walletAddress, serviceId, priceInAVAX } = await req.json();

    if (!walletAddress || serviceId === undefined || !priceInAVAX) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Find existing access record and update or insert
    const { data: existingAccess, error: findError } = await supabase
      .from('access_records')
      .select('id')
      .eq('wallet_address', walletAddress)
      .eq('service_id', serviceId)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error finding access record:', findError);
      return new Response(
        JSON.stringify({ error: 'Failed to track access' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingAccess) {
      const { error: updateAccessError } = await supabase
        .from('access_records')
        .update({ expires_at: expiresAt })
        .eq('id', existingAccess.id);

      if (updateAccessError) {
        console.error('Error updating access record:', updateAccessError);
        return new Response(
          JSON.stringify({ error: 'Failed to track access' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const { error: insertAccessError } = await supabase
        .from('access_records')
        .insert({
          wallet_address: walletAddress,
          service_id: serviceId,
          expires_at: expiresAt,
        });

      if (insertAccessError) {
        console.error('Error inserting access record:', insertAccessError);
        return new Response(
          JSON.stringify({ error: 'Failed to track access' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }


    // Update leaderboard stats
    const { data: existingStats } = await supabase
      .from('leaderboard_stats')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingStats) {
      // Update existing stats
      const prevTotal = parseFloat(String(existingStats.total_spent ?? 0));
      const newTotalSpent = prevTotal + parseFloat(String(priceInAVAX));
      const { error: updateError } = await supabase
        .from('leaderboard_stats')
        .update({
          total_spent: newTotalSpent,
          services_used: (existingStats.services_used ?? 0) + 1,
          last_payment_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress);

      if (updateError) {
        console.error('Error updating leaderboard:', updateError);
      }
    } else {
      // Insert new stats
      const { error: insertError } = await supabase
        .from('leaderboard_stats')
        .insert({
          wallet_address: walletAddress,
          total_spent: parseFloat(priceInAVAX),
          services_used: 1,
          last_payment_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting leaderboard:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        expiresAt,
        message: 'Access tracked successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-access function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

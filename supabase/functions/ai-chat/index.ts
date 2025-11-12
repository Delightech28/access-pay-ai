import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userAddress, serviceId, prompt } = await req.json();

    if (!userAddress || serviceId === undefined || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user has access
    const { data: accessRecords, error: accessError } = await supabase
      .from('access_records')
      .select('*')
      .eq('wallet_address', userAddress.toLowerCase())
      .eq('service_id', serviceId)
      .single();

    if (accessError || !accessRecords) {
      console.log('No access found for user:', userAddress, 'service:', serviceId);
      return new Response(
        JSON.stringify({ 
          error: 'Payment Required',
          message: 'You need to pay for access to use this service'
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if access has expired
    const expiresAt = new Date(accessRecords.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      console.log('Access expired for user:', userAddress);
      return new Response(
        JSON.stringify({ 
          error: 'Access Expired',
          message: 'Your access has expired. Please purchase again.'
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User has valid access, generate AI response
    console.log('User has valid access, generating response for prompt:', prompt);
    
    // Generate mock AI response based on service
    const serviceName = serviceId === 0 ? 'GPT-4' : 'Gemini';
    const response = generateMockAIResponse(prompt, serviceName);

    return new Response(
      JSON.stringify({
        response,
        timestamp: new Date().toISOString(),
        service: serviceName
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateMockAIResponse(prompt: string, serviceName: string): string {
  const responses = [
    `As ${serviceName}, I understand you're asking about: "${prompt}". This is a demonstration response showing the x402 payment protocol in action.`,
    `${serviceName} here! Your question "${prompt}" is interesting. This response proves you have active access to the AI service.`,
    `Great question! Through ${serviceName}, I can tell you that "${prompt}" is a valid query. Your payment has been verified and you have active access.`,
    `${serviceName} response: I've received your prompt "${prompt}". This demonstrates blockchain-gated AI access working perfectly!`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

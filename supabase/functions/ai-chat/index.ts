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
    
    const serviceName = serviceId === 0 ? 'Gemini' : serviceId === 1 ? 'GPT-4' : 'AI Service';
    let response: string;

    // For Gemini service (serviceId 0), call real Gemini API
    if (serviceId === 0) {
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiApiKey) {
        console.error('GEMINI_API_KEY not configured');
        return new Response(
          JSON.stringify({ error: 'Gemini API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ text: prompt }]
              }]
            })
          }
        );

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.text();
          console.error('Gemini API error:', geminiResponse.status, errorData);
          throw new Error(`Gemini API returned ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                   'Sorry, I could not generate a response.';

        // Log usage for tracking/leaderboard
        console.log('Gemini API call successful for user:', userAddress);
        
        // Update usage stats in leaderboard_stats table
        const { error: updateError } = await supabase.rpc('increment_service_usage', {
          p_wallet_address: userAddress.toLowerCase(),
          p_service_id: serviceId
        });
        
        if (updateError) {
          console.error('Failed to update usage stats:', updateError);
        }

      } catch (error) {
        console.error('Error calling Gemini API:', error);
        return new Response(
          JSON.stringify({ 
            error: 'AI Service Error',
            message: 'Failed to connect to Gemini AI. Please try again in a moment.'
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // For other services, return an error indicating they need to use a supported service
      return new Response(
        JSON.stringify({ 
          error: 'Service Not Available',
          message: `${serviceName} is not yet integrated. Please use Gemini AI (Service ID 0) for real AI responses.`
        }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

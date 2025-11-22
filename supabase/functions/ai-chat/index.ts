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
    const { userAddress, serviceId, prompt, file } = await req.json();

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
    let generatedImage: string | undefined;

    // Detect if user wants an image - check for generation keywords
    const imageKeywords = ['generate', 'create', 'draw', 'make', 'design', 'picture', 'image', 'show me'];
    const wantsImage = imageKeywords.some(keyword => {
      const lowerPrompt = prompt.toLowerCase();
      // Check if keyword appears at start or after common words
      return lowerPrompt.startsWith(keyword) || 
             lowerPrompt.includes(` ${keyword} `) ||
             lowerPrompt.includes(`${keyword} a`) ||
             lowerPrompt.includes(`${keyword} an`);
    });

    // For Gemini service (serviceId 0)
    if (serviceId === 0) {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) {
        console.error('LOVABLE_API_KEY not configured');
        return new Response(
          JSON.stringify({ error: 'AI service not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // If user wants an image, use image generation model
        if (wantsImage) {
          console.log('Generating image with Lovable AI');
          const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [{
                role: 'user',
                content: prompt.replace(/^(generate|create|draw|make|design|picture of|image of|show me)\s*/gi, '').trim()
              }],
              modalities: ['image', 'text']
            })
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.text();
            console.error('Image generation error:', imageResponse.status, errorData);
            throw new Error(`Image generation failed: ${imageResponse.status}`);
          }

          const imageData = await imageResponse.json();
          generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          response = imageData.choices?.[0]?.message?.content || 'Image generated successfully!';
        } else {
          // Text-based conversation with file support
          const messageContent: any[] = [{ type: 'text', text: prompt }];
          
          // Add file if present
          if (file) {
            messageContent.push({
              type: 'image_url',
              image_url: { url: file.data }
            });
          }

          const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{
                role: 'user',
                content: messageContent
              }]
            })
          });

          if (!geminiResponse.ok) {
            const errorData = await geminiResponse.text();
            console.error('Gemini API error:', geminiResponse.status, errorData);
            throw new Error(`Gemini API returned ${geminiResponse.status}`);
          }

          const geminiData = await geminiResponse.json();
          response = geminiData.choices?.[0]?.message?.content || 
                     'Sorry, I could not generate a response.';
        }

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
    } else if (serviceId === 1) {
      // For GPT-4 service (serviceId 1), call OpenAI API
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        console.error('OPENAI_API_KEY not configured');
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const openaiResponse = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'user', content: prompt }
              ]
            })
          }
        );

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.text();
          console.error('OpenAI API error:', openaiResponse.status, errorData);
          throw new Error(`OpenAI API returned ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        response = openaiData.choices?.[0]?.message?.content || 
                   'Sorry, I could not generate a response.';

        // Log usage for tracking/leaderboard
        console.log('OpenAI API call successful for user:', userAddress);
        
        // Update usage stats in leaderboard_stats table
        const { error: updateError } = await supabase.rpc('increment_service_usage', {
          p_wallet_address: userAddress.toLowerCase(),
          p_service_id: serviceId
        });
        
        if (updateError) {
          console.error('Failed to update usage stats:', updateError);
        }

      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return new Response(
          JSON.stringify({ 
            error: 'AI Service Error',
            message: 'Failed to connect to GPT-4. Please try again in a moment.'
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // For other services, return an error indicating they need to use a supported service
      return new Response(
        JSON.stringify({ 
          error: 'Service Not Available',
          message: `${serviceName} is not yet integrated. Please use Gemini AI (Service ID 0) or GPT-4 (Service ID 1) for real AI responses.`
        }),
        { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        response,
        timestamp: new Date().toISOString(),
        service: serviceName,
        ...(generatedImage && { image: generatedImage })
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

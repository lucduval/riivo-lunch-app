import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.14.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, restaurant_id } = await req.json()
    
    // Setup Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Fetch menu items for the restaurant
    const { data: menuItems, error: menuError } = await supabaseClient
      .from('menu_items')
      .select('id, name, description, category, order_count')
      .eq('restaurant_id', restaurant_id)

    if (menuError) throw menuError

    let preferences = null
    if (user_id) {
        const { data } = await supabaseClient
        .from('user_preferences')
        .select('dietary_tags')
        .eq('user_id', user_id)
        .maybeSingle()
        preferences = data;
    }

    // Initialize Anthropic
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    const promptMessage = `
    You are an AI recommendation engine for a deadpan lunch app called Fig.
    Given the following menu items, the user's dietary preferences (if any), and the popularity of each item, return a JSON array containing EXACTLY 3 recommended menu_item_ids along with a one-line deadpan rationale for each request. 
    The tone of the rationale must be highly objective, surgical, and minimal. Examples: "Popular with 9 colleagues. Ordered twice by you. Statistically sound.", "High protein-to-carbohydrate ratio. Logical choice for midday.", "Currently trending. Resistance is futile."
    
    User Preferences: ${JSON.stringify(preferences?.dietary_tags || [])}
    Menu Items: ${JSON.stringify(menuItems)}

    Respond ONLY with a valid JSON array in this exact format, with no markdown code blocks or extra text or backticks around it:
    [
      { "id": "uuid-here", "rationale": "Deadpan rationale string here." }
    ]`

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{ role: "user", content: promptMessage }],
      temperature: 0.2,
    });

    let returnText = msg.content[0].text.trim();
    if (returnText.startsWith('```json')) {
      returnText = returnText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    }

    const recommendationData = JSON.parse(returnText);

    return new Response(JSON.stringify(recommendationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

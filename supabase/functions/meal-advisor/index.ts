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
    const { restaurant_id, answers } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: menuItems, error: menuError } = await supabaseClient
      .from('menu_items')
      .select('id, name, description, price, category, order_count')
      .eq('restaurant_id', restaurant_id)

    if (menuError) throw menuError

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    const promptMessage = `
You are Fig's meal advisor — a witty, deadpan AI that helps indecisive lunch-goers find their perfect meal.

A user just completed a questionnaire about their lunch mood. Based on their answers below AND the full restaurant menu, recommend exactly 3 menu items that best match their vibe.

USER'S ANSWERS:
- Hunger level: ${answers.hunger}
- Mood: ${answers.mood}
- Adventurousness: ${answers.adventurous}
- Fun question answer: ${answers.funAnswer}
- Dietary preference: ${answers.dietary}

FULL MENU:
${JSON.stringify(menuItems)}

Return ONLY a valid JSON array (no markdown, no backticks) with exactly 3 items in this format:
[
  { "id": "uuid-here", "name": "Item Name", "price": 150.00, "category": "Pizza", "rationale": "A witty 1-2 sentence reason why this matches them. Be deadpan funny." }
]

Rules:
- Pick items from DIFFERENT categories when possible (e.g. one pasta, one pizza, one main)
- Factor in hunger level: low hunger = lighter dishes (salads, panini, antipasti), high hunger = mains, baked pasta, hearty pizzas
- Factor in mood and adventurousness
- The rationale should be entertaining but also genuinely explain why it's a good match
- Use the fun question answer to add personality to at least one rationale`

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: promptMessage }],
      temperature: 0.7,
    })

    let returnText = msg.content[0].text.trim()
    if (returnText.startsWith('```json')) {
      returnText = returnText.replace(/```json\n?/, '').replace(/```\n?$/, '')
    }
    if (returnText.startsWith('```')) {
      returnText = returnText.replace(/```\n?/, '').replace(/```\n?$/, '')
    }

    const recommendationData = JSON.parse(returnText)

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

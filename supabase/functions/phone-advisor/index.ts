import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PHONE_CATALOG = `
Available phones in our catalog:

1. iPhone 15 Pro Max - ₹1,59,900 - Apple's flagship with A17 Pro chip, 48MP camera with 5x zoom, titanium design
2. Samsung Galaxy S24 Ultra - ₹1,34,999 - 200MP camera, Galaxy AI, S Pen, Snapdragon 8 Gen 3
3. OnePlus 12 - ₹64,999 - 100W fast charging, Hasselblad camera, Snapdragon 8 Gen 3
4. Google Pixel 8 Pro - ₹1,06,999 - Best AI features, 7 years updates, exceptional camera
5. Xiaomi 14 Ultra - ₹99,999 - Leica quad camera with variable aperture, 90W charging
6. iPhone 15 - ₹79,900 - Dynamic Island, 48MP camera, USB-C, great value Apple
7. Samsung Galaxy S24 - ₹74,999 - Compact flagship with Galaxy AI, 7 years updates
8. Nothing Phone (2) - ₹44,999 - Unique Glyph Interface, clean software, great value
9. Realme GT 5 Pro - ₹35,999 - Budget flagship with Snapdragon 8 Gen 3, 100W charging
10. Vivo X100 Pro - ₹89,999 - ZEISS optics, 100MP telephoto, photography focused
11. OPPO Find X7 Ultra - ₹94,999 - Dual periscope cameras, Hasselblad colors
12. Motorola Razr 50 Ultra - ₹99,999 - Flip phone with 4-inch external display
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a friendly and knowledgeable phone advisor for PhoneExperience, a smartphone trial service in India. Help users find the perfect phone based on their needs, budget, and preferences.

${PHONE_CATALOG}

Guidelines:
- Be conversational, friendly, and helpful
- Ask clarifying questions to understand user needs (budget, use case, preferences)
- Recommend 1-3 phones based on their requirements
- Explain why each recommendation suits their needs
- Mention key features and price in INR (use ₹ symbol)
- If they mention a budget, respect it strictly
- You can compare phones when asked
- Keep responses concise but informative
- Encourage them to try phones before buying (our service lets them experience phones at home for just ₹499/phone)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Phone advisor error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

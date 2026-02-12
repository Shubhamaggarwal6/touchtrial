import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()

    if (!phone || typeof phone !== 'string' || phone.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Valid phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Delete existing OTPs for this phone
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('phone', phone)

    // Store new OTP
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert({
        phone,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // In production, integrate an SMS provider here to send the OTP
    // For development, we return the OTP in the response
    const isDev = true // Set to false in production
    
    console.log(`OTP for ${phone}: ${otpCode}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        ...(isDev ? { otp: otpCode } : {})
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

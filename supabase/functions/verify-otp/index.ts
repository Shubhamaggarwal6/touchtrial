import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validate OTP is exactly 6 digits
function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

// Validate Indian phone number format
function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanPhone = String(phone).replace(/^\+91/, '').replace(/\s/g, '')
    const cleanOtp = String(otp).trim()

    if (!isValidPhone(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!isValidOtp(cleanOtp)) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP format. Must be 6 digits.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Rate limiting: max 5 verify attempts per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentAttempts } = await supabase
      .from('otp_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('phone', cleanPhone)
      .gte('created_at', oneHourAgo)

    // Use attempts tracking - if there are many expired/failed records, block
    if (recentAttempts !== null && recentAttempts > 5) {
      return new Response(
        JSON.stringify({ error: 'Too many verification attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find matching OTP
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('otp_code', cleanOtp)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark as verified
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', data.id)

    return new Response(
      JSON.stringify({ success: true, verified: true }),
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

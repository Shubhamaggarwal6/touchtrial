import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255
}

async function sendEmailViaSMTP(to: string, otpCode: string): Promise<void> {
  const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASS')
  const fromEmail = Deno.env.get('SMTP_FROM') || smtpUser

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured')
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 24px; margin: 0;">TouchTrial</h2>
      </div>
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; text-align: center;">
        <h3 style="color: #333; margin-bottom: 10px;">Email Verification</h3>
        <p style="color: #666; margin-bottom: 20px;">Your one-time verification code is:</p>
        <div style="background: #fff; border: 2px dashed #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #333;">${otpCode}</span>
        </div>
        <p style="color: #999; font-size: 13px;">This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
      <p style="text-align: center; color: #bbb; font-size: 12px; margin-top: 20px;">TouchTrial &mdash; Experience before you buy</p>
    </div>
  `

  await transporter.sendMail({
    from: `TouchTrial <${fromEmail}>`,
    to,
    subject: `Your TouchTrial Verification Code: ${otpCode}`,
    html: emailHtml,
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    if (!isValidEmail(cleanEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check if email is already registered
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'This email is already registered. Please sign in instead.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting: max 3 OTP sends per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('email_otp_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('email', cleanEmail)
      .gte('created_at', oneHourAgo)

    if (count !== null && count >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many OTP requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Delete existing OTPs for this email
    await supabase
      .from('email_otp_verifications')
      .delete()
      .eq('email', cleanEmail)

    // Store new OTP
    const { error: insertError } = await supabase
      .from('email_otp_verifications')
      .insert({
        email: cleanEmail,
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

    // Send email via SMTP using nodemailer
    await sendEmailViaSMTP(cleanEmail, otpCode)

    return new Response(
      JSON.stringify({ success: true, message: 'OTP sent to your email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('SMTP Error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please verify your SMTP credentials.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

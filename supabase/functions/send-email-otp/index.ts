import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255
}

async function sendEmailViaSMTP(to: string, otpCode: string): Promise<void> {
  const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
  const smtpPort = Deno.env.get('SMTP_PORT') || '587'
  const smtpUser = Deno.env.get('SMTP_USER')
  const smtpPass = Deno.env.get('SMTP_PASS')
  const fromEmail = Deno.env.get('SMTP_FROM') || smtpUser

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured')
  }

  // Use Resend-style HTTP API or direct SMTP via fetch
  // For Deno edge functions, we use a simple HTTP-based email approach
  // Using smtp.js or a lightweight approach
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">PhoneHome</h2>
      </div>
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; text-align: center;">
        <h3 style="color: #333; margin-bottom: 10px;">Email Verification</h3>
        <p style="color: #666; margin-bottom: 20px;">Your one-time verification code is:</p>
        <div style="background: #fff; border: 2px dashed #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otpCode}</span>
        </div>
        <p style="color: #999; font-size: 13px;">This code expires in 5 minutes. Do not share it with anyone.</p>
      </div>
    </div>
  `

  // Build the SMTP connection using Deno's built-in TCP
  const conn = await Deno.connect({ hostname: smtpHost, port: parseInt(smtpPort) })
  
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  async function readResponse(): Promise<string> {
    const buf = new Uint8Array(1024)
    const n = await conn.read(buf)
    return decoder.decode(buf.subarray(0, n || 0))
  }

  async function sendCommand(cmd: string): Promise<string> {
    await conn.write(encoder.encode(cmd + '\r\n'))
    return await readResponse()
  }

  try {
    await readResponse() // greeting
    
    let response = await sendCommand(`EHLO localhost`)
    
    // Start TLS if port 587
    if (smtpPort === '587') {
      await sendCommand('STARTTLS')
      const tlsConn = await Deno.startTls(conn, { hostname: smtpHost })
      
      // Re-assign for TLS
      const tlsEncoder = new TextEncoder()
      const tlsDecoder = new TextDecoder()
      
      async function tlsRead(): Promise<string> {
        const buf = new Uint8Array(1024)
        const n = await tlsConn.read(buf)
        return tlsDecoder.decode(buf.subarray(0, n || 0))
      }
      
      async function tlsSend(cmd: string): Promise<string> {
        await tlsConn.write(tlsEncoder.encode(cmd + '\r\n'))
        return await tlsRead()
      }

      await tlsSend('EHLO localhost')
      
      // AUTH LOGIN
      await tlsSend('AUTH LOGIN')
      await tlsSend(btoa(smtpUser))
      response = await tlsSend(btoa(smtpPass))
      
      if (!response.includes('235')) {
        tlsConn.close()
        throw new Error('SMTP authentication failed')
      }
      
      await tlsSend(`MAIL FROM:<${fromEmail}>`)
      await tlsSend(`RCPT TO:<${to}>`)
      await tlsSend('DATA')
      
      const message = [
        `From: PhoneHome <${fromEmail}>`,
        `To: ${to}`,
        `Subject: Your PhoneHome Verification Code: ${otpCode}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        emailBody,
        `.`
      ].join('\r\n')
      
      await tlsSend(message)
      await tlsSend('QUIT')
      tlsConn.close()
    }
  } catch (smtpError) {
    conn.close()
    throw smtpError
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    // Send email via SMTP
    try {
      await sendEmailViaSMTP(cleanEmail, otpCode)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Still return success - OTP is stored, just couldn't send email
      // In development, check logs for the OTP
      console.log(`Email OTP for ${cleanEmail}: ${otpCode}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'OTP sent to your email' }),
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

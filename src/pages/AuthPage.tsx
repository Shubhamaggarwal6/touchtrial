import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Smartphone, Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone, CheckCircle } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  gender: z.string().min(1, 'Please select your gender'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Phone OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Email OTP state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Cooldown timers
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  useEffect(() => {
    if (emailOtpCooldown <= 0) return;
    const timer = setInterval(() => setEmailOtpCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [emailOtpCooldown]);

  // Reset OTP state when phone/email changes
  useEffect(() => {
    setOtpSent(false);
    setOtpValue('');
    setPhoneVerified(false);
  }, [phoneNumber]);

  useEffect(() => {
    setEmailOtpSent(false);
    setEmailOtpValue('');
    setEmailVerified(false);
  }, [email]);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setErrors((prev) => ({ ...prev, phone: 'Please enter a valid 10-digit mobile number' }));
      return;
    }
    setErrors((prev) => { const { phone, ...rest } = prev; return rest; });
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phoneNumber },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOtpSent(true);
      setOtpCooldown(30);
      toast({ title: 'OTP Sent', description: 'A 6-digit code has been sent to your phone.' });
    } catch (err: any) {
      toast({ title: 'Failed to send OTP', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) return;
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: phoneNumber, otp: otpValue },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPhoneVerified(true);
      toast({ title: 'Phone Verified!', description: 'Your mobile number has been verified.' });
    } catch (err: any) {
      toast({ title: 'Verification Failed', description: err.message || 'Invalid or expired OTP.', variant: 'destructive' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!z.string().email().safeParse(email).success) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    setErrors((prev) => { const { email, ...rest } = prev; return rest; });
    setEmailOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-otp', {
        body: { email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEmailOtpSent(true);
      setEmailOtpCooldown(30);
      toast({ title: 'Email OTP Sent', description: 'A 6-digit code has been sent to your email.' });
    } catch (err: any) {
      toast({ title: 'Failed to send OTP', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtpValue.length !== 6) return;
    setEmailOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-email-otp', {
        body: { email, otp: emailOtpValue },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEmailVerified(true);
      toast({ title: 'Email Verified!', description: 'Your email has been verified.' });
    } catch (err: any) {
      toast({ title: 'Verification Failed', description: err.message || 'Invalid or expired OTP.', variant: 'destructive' });
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!z.string().email().safeParse(forgotEmail).success) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reset Link Sent!', description: 'Check your email for a password reset link.' });
    }
    setForgotLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message === 'Invalid login credentials' 
              ? 'Invalid email or password. Please try again.' 
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
          navigate('/');
        }
      } else {
        if (!phoneVerified) {
          toast({ title: 'Phone not verified', description: 'Please verify your mobile number before signing up.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        if (!emailVerified) {
          toast({ title: 'Email not verified', description: 'Please verify your email before signing up.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }

        const result = signupSchema.safeParse({ fullName, email, phone: phoneNumber, gender, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(email, password, fullName, phoneNumber, gender);
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            toast({ title: 'Account Exists', description: 'This email is already registered. Please login instead.', variant: 'destructive' });
          } else {
            toast({ title: 'Signup Failed', description: signUpError.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Account Created!', description: 'Your account has been created successfully. Please check your email to confirm.' });
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl gradient-hero flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Forgot Password</h2>
            <p className="text-muted-foreground mt-2">Enter your email and we'll send you a reset link.</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="forgotEmail" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="pl-10" disabled={forgotLoading} />
              </div>
            </div>

            <Button className="w-full gap-2" disabled={forgotLoading} onClick={handleForgotPassword}>
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <button type="button" onClick={() => setShowForgotPassword(false)} className="text-primary font-medium hover:underline text-sm">
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <div className="h-20 w-20 rounded-2xl bg-background/10 backdrop-blur-sm flex items-center justify-center">
              <Smartphone className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">TouchTrial</h1>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Try smartphones at home before you buy. No more guesswork, just confidence.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="h-8 w-8 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">1</div>
              <span>Select phones you want to experience</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="h-8 w-8 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">2</div>
              <span>Our expert visits you with the phones for a hands-on demo</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="h-8 w-8 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">3</div>
              <span>Buy your favourite or the expert takes them all back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">TouchTrial</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Start your phone experience journey today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" disabled={isLoading} />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender} disabled={isLoading}>
                    <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phoneNumber" type="tel" placeholder="9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} className="pl-10" disabled={isLoading || phoneVerified} maxLength={10} />
                    </div>
                    {phoneVerified ? (
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600 px-3">
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </div>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="shrink-0 h-10" disabled={otpLoading || otpCooldown > 0 || phoneNumber.length !== 10} onClick={handleSendOtp}>
                        {otpLoading ? 'Sending...' : otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                    )}
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                {otpSent && !phoneVerified && (
                  <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                    <Label>Enter OTP sent to your phone</Label>
                    <div className="flex items-center gap-3">
                      <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button type="button" size="sm" disabled={otpValue.length !== 6 || otpLoading} onClick={handleVerifyOtp}>
                        {otpLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className={!isLogin ? "flex gap-2" : ""}>
                <div className={`relative ${!isLogin ? 'flex-1' : ''}`}>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isLoading || (!isLogin && emailVerified)} />
                </div>
                {!isLogin && (
                  emailVerified ? (
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600 px-3">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </div>
                  ) : (
                    <Button type="button" variant="outline" size="sm" className="shrink-0 h-10" disabled={emailOtpLoading || emailOtpCooldown > 0 || !email} onClick={handleSendEmailOtp}>
                      {emailOtpLoading ? 'Sending...' : emailOtpCooldown > 0 ? `Resend (${emailOtpCooldown}s)` : emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </Button>
                  )
                )}
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {!isLogin && emailOtpSent && !emailVerified && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                <Label>Enter OTP sent to your email</Label>
                <div className="flex items-center gap-3">
                  <InputOTP maxLength={6} value={emailOtpValue} onChange={setEmailOtpValue}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button type="button" size="sm" disabled={emailOtpValue.length !== 6 || emailOtpLoading} onClick={handleVerifyEmailOtp}>
                    {emailOtpLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading || (!isLogin && (!phoneVerified || !emailVerified))}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                const { error } = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
                if (error) {
                  toast({ title: 'Google Sign-In Failed', description: error.message || 'Something went wrong.', variant: 'destructive' });
                  setIsLoading(false);
                }
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="ml-1 text-primary font-medium hover:underline">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

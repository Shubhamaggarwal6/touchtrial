import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Smartphone, Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

type SignupStep = 'details' | 'otp';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupStep, setSignupStep] = useState<SignupStep>('details');
  const [otpValue, setOtpValue] = useState('');
  const [devOtp, setDevOtp] = useState('');
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phoneNumber },
      });

      if (error || !data?.success) {
        toast({
          title: 'Failed to send OTP',
          description: error?.message || 'Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }

      // In dev mode, show the OTP
      if (data.otp) {
        setDevOtp(data.otp);
        toast({
          title: 'Dev Mode: OTP Code',
          description: `Your OTP is: ${data.otp}`,
        });
      } else {
        toast({
          title: 'OTP Sent!',
          description: `Verification code sent to ${phoneNumber}`,
        });
      }
      setIsLoading(false);
      return true;
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send verification code.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: phoneNumber, otp: otpValue },
      });

      if (error || !data?.verified) {
        toast({
          title: 'Invalid OTP',
          description: 'The code is invalid or expired. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // OTP verified, now create the account
      const { error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            title: 'Account Exists',
            description: 'This email is already registered. Please login instead.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Signup Failed',
            description: signUpError.message,
            variant: 'destructive',
          });
        }
      } else {
        // Update profile with phone number and verified status
        toast({
          title: 'Account Created!',
          description: 'Welcome to PhoneHome! You can now start booking phones.',
        });
        navigate('/');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
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
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/');
        }
      } else {
        // Signup - Step 1: validate details
        const result = signupSchema.safeParse({ fullName, email, password, phone: phoneNumber });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        // Send OTP
        const sent = await handleSendOtp();
        if (sent) {
          setSignupStep('otp');
        }
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            PhoneHome
          </h1>
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
              <span>Try them at home for 3 days</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="h-8 w-8 rounded-full bg-background/20 flex items-center justify-center text-sm font-bold">3</div>
              <span>Buy or return - fee refunded on purchase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl gradient-hero flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">PhoneHome</span>
            </div>
          </div>

          {/* OTP Verification Step */}
          {!isLogin && signupStep === 'otp' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold">Verify your phone</h2>
                <p className="text-muted-foreground mt-2">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>

              {devOtp && (
                <div className="bg-muted/50 border border-border rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Dev Mode — OTP Code:</p>
                  <p className="text-lg font-mono font-bold tracking-widest">{devOtp}</p>
                </div>
              )}

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={(value) => setOtpValue(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full gap-2"
                disabled={isLoading || otpValue.length !== 6}
                onClick={handleVerifyOtp}
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Resend Code
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => {
                    setSignupStep('details');
                    setOtpValue('');
                    setDevOtp('');
                  }}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  ← Back to details
                </button>
              </div>
            </div>
          ) : (
            <>
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
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Continue')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="text-center">
                <p className="text-muted-foreground">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setSignupStep('details');
                      setOtpValue('');
                      setDevOtp('');
                    }}
                    className="ml-1 text-primary font-medium hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

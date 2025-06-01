'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/useAuthStore';

enum LoginStep {
  LOGIN_FORM = 'LOGIN_FORM',
  OTP_VERIFICATION = 'OTP_VERIFICATION'
}

const VendorLoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<LoginStep>(LoginStep.LOGIN_FORM);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Auth store state and actions
  const {
    isLoading,
    error,
    login,
    verifyLoginOTP,
    resendLoginOTP,
    requireOTP,
    otpEmail,
    isAuthenticated,
    clearState
  } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  // Setup countdown timer when OTP is sent
  useEffect(() => {
    if (requireOTP && expiryTime) {
      const timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = expiryTime - now;
        
        if (remaining <= 0) {
          clearInterval(timer);
          setCountdown(0);
        } else {
          setCountdown(remaining);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [requireOTP, expiryTime]);

  // Handle transition to OTP step when backend sends OTP
  useEffect(() => {
    if (requireOTP && otpEmail) {
      setStep(LoginStep.OTP_VERIFICATION);
      // Set expiry time to 10 minutes from now (OTP_SETTINGS.EXPIRY_SECONDS from backend)
      setExpiryTime(Math.floor(Date.now() / 1000) + 10 * 60);
    }
  }, [requireOTP, otpEmail]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if user has a vendor profile
      const user = useAuthStore.getState().user;
      
      if (user?.vendor) {
        // Existing vendor account - redirect to dashboard
        router.push('/dashboard');
      } else {
        // New account - redirect to profile to complete setup
        router.push('/profile');
      }
    }
  }, [isAuthenticated, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'rememberMe') {
      setRememberMe(checked);
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear errors when typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    // Update the OTP code array
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);
    setOtpError('');
    
    // Auto-focus to next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle backspace in OTP fields
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // If backspace and empty current field, focus previous field
    if (e.key === 'Backspace' && otpCode[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  
  const validate = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Handle initial form submission
  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await login(formData.email, formData.password, rememberMe);
  };

  // Handle OTP verification submission
  const handleSubmitOTP = async () => {
    // Check if OTP is complete
    const fullOtp = otpCode.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code');
      return;
    }

    if (!otpEmail) {
      setOtpError('Email address is missing');
      return;
    }

    await verifyLoginOTP(otpEmail, fullOtp, rememberMe);
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    if (!otpEmail) return;
    
    await resendLoginOTP(otpEmail);
    // Reset countdown after resend
    setExpiryTime(Math.floor(Date.now() / 1000) + 10 * 60);
    setCountdown(10 * 60);
  };

  // Format countdown time
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Go back to form step
  const handleBackToForm = () => {
    clearState();
    setStep(LoginStep.LOGIN_FORM);
    setOtpCode(['', '', '', '', '', '']);
    setOtpError('');
  };

  // Content based on step
  const renderContent = () => {
    if (step === LoginStep.LOGIN_FORM) {
      return (
        <form onSubmit={handleSubmitLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-card px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary ${
                    errors.email ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-card px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary ${
                    errors.password ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-600">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Global error message */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 transition-all duration-200"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      );
    } else if (step === LoginStep.OTP_VERIFICATION) {
      return (
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">Verify Your Login</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a verification code to <span className="font-medium text-foreground">{otpEmail}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The code will expire in <span className="font-medium">{formatTime(countdown)}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="sr-only">Verification Code</label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-input focus:border-primary focus:ring-primary bg-card"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {otpError && <p className="mt-2 text-sm text-destructive text-center">{otpError}</p>}
              {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || (countdown !== null && countdown > 0)}
                  className="text-primary hover:text-primary-600 font-medium disabled:opacity-50"
                >
                  Resend Code
                </button>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleBackToForm}
              disabled={isLoading}
              className="py-2 px-4 rounded-lg border border-input bg-card text-sm font-medium hover:bg-accent transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmitOTP}
              disabled={isLoading || otpCode.some(digit => digit === '')}
              className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="h-5 w-5 animate-spin mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify & Login'
              )}
            </button>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg">
        {/* Header section */}
        <div className="flex flex-col items-center justify-center space-y-2 border-b border-border pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Login</h1>
          <p className="text-center text-sm text-muted-foreground">
            {step === LoginStep.LOGIN_FORM 
              ? 'Sign in to your vendor account'
              : 'Verify your identity to continue'}
          </p>
        </div>

        {/* Form section */}
        {renderContent()}

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary-600">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage;

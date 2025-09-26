import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FloatingEmojis } from "@/components/FloatingEmojis";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      
      const result = await response.json();

      if (result.success) {
        setMaskedEmail(result.email);
        setStep(2);
        
        if (result.otp) {
          // Email failed, show OTP directly
          toast.success(`${result.message}`, { duration: 10000 });
        } else {
          // Email sent successfully
          toast.success(`OTP sent to ${result.email}`);
        }
      } else {
        toast.error(result.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp })
      });
      
      const result = await response.json();

      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/');
      } else {
        toast.error(result.error || "Invalid OTP");
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 safe-area-inset touch-manipulation">
      <FloatingEmojis />
      
      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold medical-accent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Sign in to access your health assistant
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="glass-input text-base sm:text-sm"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  <p className="text-xs text-foreground/60">
                    Enter the phone number you registered with
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full medical-gradient text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="glass-input text-center text-lg sm:text-xl tracking-widest"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  <p className="text-xs text-foreground/60">
                    OTP sent to {maskedEmail}
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full medical-gradient text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => setStep(1)}
                >
                  Back to Phone Number
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/60">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate('/register')}
                  className="text-primary hover:underline font-medium"
                >
                  Register here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-foreground/50">
            Your health data is secure and private
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
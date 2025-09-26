import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createOrGetUser } from "@/services/gemini";
import { toast } from "sonner";
import { FloatingEmojis } from "@/components/FloatingEmojis";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      const result = await createOrGetUser(formData.name, cleanPhone, formData.email);

      if (result.success) {
        toast.success("Registration successful! Welcome to Surakshabot.");
        localStorage.setItem('user', JSON.stringify({
          name: formData.name,
          phone: cleanPhone,
          email: formData.email
        }));
        navigate('/');
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 safe-area-inset touch-manipulation">
      <FloatingEmojis />
      
      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold medical-accent">
              Surakshabot
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Register to access personalized health assistance
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="glass-input text-base sm:text-sm"
                  autoComplete="name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="glass-input text-base sm:text-sm"
                  autoComplete="tel"
                  inputMode="tel"
                />
                <p className="text-xs text-foreground/60">
                  Include country code for WhatsApp notifications
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="glass-input text-base sm:text-sm"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full medical-gradient text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/60">
                Already have an account?{" "}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-foreground/50">
            By registering, you agree to receive health reminders via WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
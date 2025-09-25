import { Shield, Heart, Activity, Zap, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthHeroSectionProps {
  onOpenChatbot: () => void;
}

export const HealthHeroSection = ({ onOpenChatbot }: HealthHeroSectionProps) => {
  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Main Hero */}
        <div className="glass-card p-8 md:p-12 mb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-medical-primary flex items-center justify-center pulse-glow">
                  <Heart className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium medical-accent">AI-Powered Healthcare</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Your <span className="medical-accent">Personal Health</span> Assistant is Here
              </h1>
              
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                Get instant, reliable health guidance with Surakshabot. Our AI assistant provides 24/7 support for your health questions, symptoms, and wellness journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={onOpenChatbot}
                  className="bg-medical-primary hover:bg-medical-primary/90 text-primary-foreground"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Start Health Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="glass border-medical-primary/30 text-medical-accent hover:bg-medical-primary/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card p-8 health-gradient">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-medical-accent" />
                    <div className="text-2xl font-bold medical-accent">50K+</div>
                    <div className="text-xs text-foreground/70">Happy Users</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-medical-secondary" />
                    <div className="text-2xl font-bold medical-accent">24/7</div>
                    <div className="text-xs text-foreground/70">Available</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-medical-primary" />
                    <div className="text-2xl font-bold medical-accent">Instant</div>
                    <div className="text-xs text-foreground/70">Responses</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-medical-accent" />
                    <div className="text-2xl font-bold medical-accent">100%</div>
                    <div className="text-xs text-foreground/70">Secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-medical-primary/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-medical-primary" />
            </div>
            <h3 className="font-semibold mb-2 medical-accent">Secure & Private</h3>
            <p className="text-sm text-foreground/70">Your health data is encrypted and completely confidential.</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-medical-secondary/20 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-medical-secondary" />
            </div>
            <h3 className="font-semibold mb-2 medical-accent">Real-time Analysis</h3>
            <p className="text-sm text-foreground/70">Get instant health insights and recommendations.</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-medical-accent/20 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-medical-accent" />
            </div>
            <h3 className="font-semibold mb-2 medical-accent">Personalized Care</h3>
            <p className="text-sm text-foreground/70">Tailored health advice based on your unique needs.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
import { Shield, User, UserPlus, MessageCircle, Phone, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface HealthWebsiteHeaderProps {
  onOpenChatbot: () => void;
}

export const HealthWebsiteHeader = ({ onOpenChatbot }: HealthWebsiteHeaderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };
  
  return (
    <header className="glass-card m-4 sticky top-4 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-medical-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold medical-accent">Surakshabot Health</h1>
            <p className="text-xs text-muted-foreground">Your AI Health Companion</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#services" className="text-sm font-medium text-foreground/80 hover:text-medical-accent transition-colors">
            Services
          </a>
          <a href="#about" className="text-sm font-medium text-foreground/80 hover:text-medical-accent transition-colors">
            About
          </a>
          <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-medical-accent transition-colors">
            Contact
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenChatbot}
            className="glass border-medical-primary/30 text-medical-accent hover:bg-medical-primary/10"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat Now
          </Button>
        </nav>

        {/* Auth Buttons / Profile */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 glass-card px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-medical-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium medical-accent hidden sm:block">
                  {user.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-foreground/80 hover:text-medical-accent"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex text-foreground/80 hover:text-medical-accent"
                onClick={() => navigate('/login')}
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button 
                size="sm" 
                className="bg-medical-primary hover:bg-medical-primary/90 text-primary-foreground"
                onClick={() => navigate('/register')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
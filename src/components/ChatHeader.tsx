import { Shield, Activity, Heart } from "lucide-react";

export const ChatHeader = () => {
  return (
    <div className="glass-card m-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-medical-primary pulse-glow">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-medical-accent rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold medical-accent">Surakshabot</h1>
            <p className="text-sm text-muted-foreground">Your AI Health Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="glass-card p-2 rounded-xl">
            <Activity className="h-4 w-4 text-medical-secondary" />
          </div>
          <div className="glass-card p-2 rounded-xl">
            <Heart className="h-4 w-4 text-medical-accent" />
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 rounded-xl health-gradient">
        <p className="text-sm text-foreground/90">
          I'm here to help with your health questions. Please note that I provide general information and cannot replace professional medical advice.
        </p>
      </div>
    </div>
  );
};
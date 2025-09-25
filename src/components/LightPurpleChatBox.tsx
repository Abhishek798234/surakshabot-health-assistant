import { Bot, MapPin, Calendar, Syringe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../index.css";

interface LightPurpleChatBoxProps {
  onButtonClick?: (action: string) => void;
}

export const LightPurpleChatBox = ({ onButtonClick }: LightPurpleChatBoxProps) => {
  const handleButtonClick = (action: string) => {
    if (onButtonClick) {
      onButtonClick(action);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-96 flex flex-col items-center justify-center rounded-2xl border border-light-purple-border p-6 animated-gradient-bg"
    >
      <div className="animate-bounce mb-8">
        <Bot 
          className="w-16 h-16 text-purple-600" 
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(147, 51, 234, 0.3))'
          }}
        />
      </div>
      
      <div className="space-y-3 w-full">
        <Button
          onClick={() => handleButtonClick('nearby_hospitals')}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
          size="sm"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Nearby Hospitals
        </Button>
        
        <Button
          onClick={() => handleButtonClick('appointment_alerts')}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
          size="sm"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Appointment Alerts
        </Button>
        
        <Button
          onClick={() => handleButtonClick('vaccination_alerts')}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
          size="sm"
        >
          <Syringe className="w-4 h-4 mr-2" />
          Vaccination Alerts
        </Button>
        
        <Button
          onClick={() => handleButtonClick('health_alerts')}
          className="w-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          size="sm"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Disease Outbreak Alerts
        </Button>
      </div>
    </div>
  );
};
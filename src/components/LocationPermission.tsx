import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Shield, X } from "lucide-react";
import { toast } from "sonner";

interface LocationPermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  isVisible: boolean;
}

export const LocationPermission = ({ onPermissionGranted, onPermissionDenied, isVisible }: LocationPermissionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAllowLocation = async () => {
    setIsLoading(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      localStorage.setItem('locationPermission', 'granted');
      localStorage.setItem('userLocation', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      }));
      
      toast.success("Location access granted! I can now help you find nearby medical facilities.");
      onPermissionGranted();
    } catch (error) {
      console.error('Location permission error:', error);
      toast.error("Location access denied. You can still use the chatbot, but I won't be able to find nearby facilities.");
      onPermissionDenied();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDenyLocation = () => {
    localStorage.setItem('locationPermission', 'denied');
    toast.info("Location access denied. You can enable it later in your browser settings.");
    onPermissionDenied();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="glass-card w-full max-w-md m-4">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-medical-primary/20 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-medical-primary" />
          </div>
          <CardTitle className="text-xl font-bold medical-accent">
            Location Permission
          </CardTitle>
          <CardDescription className="text-foreground/70">
            Allow Surakshabot to access your location to find nearby hospitals, clinics, and pharmacies
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Privacy Protected</p>
                <p className="text-xs text-foreground/60">Your location is only used to find nearby medical facilities and is not stored permanently.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Find Medical Help</p>
                <p className="text-xs text-foreground/60">Get instant access to nearby hospitals, clinics, and pharmacies based on your health needs.</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDenyLocation}
            >
              <X className="w-4 h-4 mr-2" />
              Not Now
            </Button>
            <Button
              className="flex-1 medical-gradient text-white"
              onClick={handleAllowLocation}
              disabled={isLoading}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isLoading ? "Getting Location..." : "Allow Location"}
            </Button>
          </div>
          
          <p className="text-xs text-center text-foreground/50">
            You can change this permission anytime in your browser settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
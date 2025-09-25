import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, ExternalLink } from "lucide-react";

interface MedicalFacility {
  name: string;
  address: string;
  rating: number;
  distance: string;
  placeId: string;
  types: string[];
}

interface MedicalFacilityCardProps {
  facility: MedicalFacility;
  index: number;
}

export const MedicalFacilityCard = ({ facility, index }: MedicalFacilityCardProps) => {
  const handleViewOnMaps = () => {
    const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${facility.placeId}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Card className="glass-card mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-medical-accent mb-1">
              {index + 1}. {facility.name}
            </h4>
            
            <div className="flex items-center text-sm text-foreground/70 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {facility.address}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                {facility.rating > 0 ? `${facility.rating}/5` : 'No rating'}
              </div>
              <div className="text-foreground/60">
                📏 {facility.distance}
              </div>
            </div>
          </div>
          
          <Button
            size="sm"
            className="medical-gradient text-white ml-3"
            onClick={handleViewOnMaps}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View on Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
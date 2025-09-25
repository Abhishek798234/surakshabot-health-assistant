interface Location {
  latitude: number;
  longitude: number;
}

interface MedicalFacility {
  name: string;
  address: string;
  rating: number;
  distance: string;
  placeId: string;
  types: string[];
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const findNearbyMedicalFacilities = async (
  location: Location,
  facilityType: 'hospital' | 'clinic' | 'pharmacy' | 'doctor',
  radius: number = 5000
): Promise<MedicalFacility[]> => {
  const typeMap = {
    hospital: 'hospital',
    clinic: 'clinic', 
    pharmacy: 'pharmacy',
    doctor: 'doctor'
  };

  const searchType = typeMap[facilityType];
  
  try {
    console.log('Sending location to backend:', {
      latitude: location.latitude,
      longitude: location.longitude,
      type: searchType,
      radius: radius
    });
    
    // Use backend API to avoid CORS issues
    const response = await fetch('http://localhost:8001/api/places/nearby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        type: searchType,
        radius: radius
      })
    });
    
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch facilities');
    }

    return data.facilities;
  } catch (error) {
    console.error('Error fetching nearby facilities:', error);
    // Return mock data on error
    return [
      {
        name: `Nearby ${facilityType}`,
        address: "Location unavailable",
        rating: 0,
        distance: "Unknown",
        placeId: "error_place_id",
        types: [facilityType]
      }
    ];
  }
};

const calculateDistance = (loc1: Location, loc2: Location): string => {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
};

export const generateMapsUrl = (facility: MedicalFacility): string => {
  return `https://www.google.com/maps/place/?q=place_id:${facility.placeId}`;
};
import { useLocationContext } from '../context/LocationContext.jsx';
import { getStoredLocation, saveLocation, searchIndianPlaces } from '../lib/location.js';

export const useUserLocation = () => {
  const context = useLocationContext();

  if (context) {
    return context;
  }

  const location = getStoredLocation();

  return {
    location,
    setLocation: saveLocation,
    searchPlaces: searchIndianPlaces,
    detectLocation: async () => null,
    detecting: false,
    error: '',
  };
};

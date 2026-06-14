import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  getStoredLocation,
  reverseGeocodeIndia,
  saveLocation,
  searchIndianPlaces,
} from '../lib/location.js';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => getStoredLocation());
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  const setLocation = useCallback((nextLocation) => {
    setLocationState(nextLocation);
    saveLocation(nextLocation);
    setError('');
  }, []);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Location access is not supported in this browser.');
      return null;
    }

    setDetecting(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });
      const nextLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        radiusKm: location.radiusKm,
        label: await reverseGeocodeIndia({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      };

      setLocation(nextLocation);
      return nextLocation;
    } catch {
      setError('Allow location access or search your area manually.');
      return null;
    } finally {
      setDetecting(false);
    }
  }, [location.radiusKm, setLocation]);

  const value = useMemo(() => ({
    location,
    setLocation,
    detectLocation,
    searchPlaces: searchIndianPlaces,
    detecting,
    error,
  }), [detecting, detectLocation, error, location, setLocation]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useLocationContext = () => useContext(LocationContext);

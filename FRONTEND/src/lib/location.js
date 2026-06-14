const STORAGE_KEY = 'urbnbzr-location';

export const DEFAULT_LOCATION = {
  lat: 28.6315,
  lng: 77.2167,
  radiusKm: 6,
  label: 'Connaught Place, New Delhi',
};

export const INDIA_LOCATION_PRESETS = [
  { label: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167, radiusKm: 6 },
  { label: 'Saket, New Delhi', lat: 28.5245, lng: 77.2066, radiusKm: 6 },
  { label: 'Sector 18, Noida', lat: 28.5708, lng: 77.3261, radiusKm: 6 },
  { label: 'Cyber Hub, Gurugram', lat: 28.4950, lng: 77.0896, radiusKm: 6 },
  { label: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295, radiusKm: 6 },
  { label: 'Andheri West, Mumbai', lat: 19.1363, lng: 72.8277, radiusKm: 6 },
  { label: 'FC Road, Pune', lat: 18.5204, lng: 73.8410, radiusKm: 6 },
  { label: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245, radiusKm: 6 },
  { label: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, radiusKm: 6 },
  { label: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7500, radiusKm: 7 },
  { label: 'HITEC City, Hyderabad', lat: 17.4435, lng: 78.3772, radiusKm: 7 },
  { label: 'T Nagar, Chennai', lat: 13.0418, lng: 80.2341, radiusKm: 6 },
  { label: 'Park Street, Kolkata', lat: 22.5535, lng: 88.3525, radiusKm: 6 },
  { label: 'Salt Lake, Kolkata', lat: 22.5867, lng: 88.4171, radiusKm: 7 },
  { label: 'CG Road, Ahmedabad', lat: 23.0276, lng: 72.5562, radiusKm: 6 },
  { label: 'MI Road, Jaipur', lat: 26.9167, lng: 75.8133, radiusKm: 6 },
  { label: 'Hazratganj, Lucknow', lat: 26.8500, lng: 80.9462, radiusKm: 6 },
  { label: 'Sector 17, Chandigarh', lat: 30.7415, lng: 76.7821, radiusKm: 6 },
  { label: 'MG Road, Kochi', lat: 9.9765, lng: 76.2773, radiusKm: 6 },
  { label: 'Gandhipuram, Coimbatore', lat: 11.0183, lng: 76.9674, radiusKm: 6 },
  { label: 'Vijay Nagar, Indore', lat: 22.7533, lng: 75.8937, radiusKm: 6 },
  { label: 'Civil Lines, Nagpur', lat: 21.1520, lng: 79.0824, radiusKm: 6 },
  { label: 'Boring Road, Patna', lat: 25.6127, lng: 85.1217, radiusKm: 6 },
  { label: 'GS Road, Guwahati', lat: 26.1445, lng: 91.7362, radiusKm: 6 },
  { label: 'Saheed Nagar, Bhubaneswar', lat: 20.2920, lng: 85.8486, radiusKm: 6 },
];

const normalizeLocation = (location) => ({
  lat: Number(location.lat),
  lng: Number(location.lng),
  radiusKm: Number(location.radiusKm) || DEFAULT_LOCATION.radiusKm,
  label: location.label || DEFAULT_LOCATION.label,
});

export const getStoredLocation = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

    if (
      parsed &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number'
    ) {
      return {
        ...normalizeLocation(parsed),
      };
    }
  } catch {
    return DEFAULT_LOCATION;
  }

  return DEFAULT_LOCATION;
};

export const saveLocation = (location) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeLocation(location)));
};

export const searchStoredIndianLocations = (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return INDIA_LOCATION_PRESETS.slice(0, 6);
  }

  return INDIA_LOCATION_PRESETS
    .filter((location) => location.label.toLowerCase().includes(normalizedQuery))
    .slice(0, 6);
};

export const searchIndianPlaces = async (query) => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 3) {
    return searchStoredIndianLocations(normalizedQuery);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(normalizedQuery)}`
    );

    if (!response.ok) {
      throw new Error('Location search failed.');
    }

    const places = await response.json();
    const remoteResults = places.map((place) => ({
      label: place.display_name.split(',').slice(0, 3).join(','),
      lat: Number(place.lat),
      lng: Number(place.lon),
      radiusKm: DEFAULT_LOCATION.radiusKm,
    }));

    return remoteResults.length > 0
      ? remoteResults
      : searchStoredIndianLocations(normalizedQuery);
  } catch {
    return searchStoredIndianLocations(normalizedQuery);
  }
};

export const reverseGeocodeIndia = async ({ lat, lng }) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed.');
    }

    const place = await response.json();
    const area = place.address?.neighbourhood || place.address?.suburb || place.address?.city_district;
    const city = place.address?.city || place.address?.town || place.address?.state_district || place.address?.state;

    return [area, city].filter(Boolean).join(', ') || place.display_name?.split(',').slice(0, 2).join(', ');
  } catch {
    return 'Current location';
  }
};

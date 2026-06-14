import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LocateFixed, MapPin, Search } from 'lucide-react';
import { useUserLocation } from '../../hooks/useUserLocation.js';
import styles from './LocationSelector.module.scss';

const RADIUS_OPTIONS = [3, 6, 10, 15];

const shortLabel = (label) => label.split(',').slice(0, 2).join(', ');
const stopEnterSubmit = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};

export default function LocationSelector() {
  const { location, setLocation, searchPlaces, detectLocation, detecting, error } = useUserLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [lat, setLat] = useState(String(location.lat));
  const [lng, setLng] = useState(String(location.lng));

  useEffect(() => {
    let active = true;

    const search = async () => {
      const places = await searchPlaces(query);

      if (active) {
        setResults(places);
      }
    };

    const handle = window.setTimeout(search, query.trim().length >= 3 ? 300 : 0);

    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [query, searchPlaces]);

  useEffect(() => {
    setLat(String(location.lat));
    setLng(String(location.lng));
  }, [location.lat, location.lng]);

  const chooseLocation = (nextLocation) => {
    setLocation({
      ...nextLocation,
      radiusKm: location.radiusKm,
    });
    setOpen(false);
    setQuery('');
  };

  const setRadius = (radiusKm) => {
    setLocation({
      ...location,
      radiusKm,
    });
  };

  const applyCustomLocation = () => {
    const nextLat = Number(lat);
    const nextLng = Number(lng);

    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) {
      return;
    }

    setLocation({
      lat: nextLat,
      lng: nextLng,
      radiusKm: location.radiusKm,
      label: query.trim() || `Custom location ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`,
    });
    setOpen(false);
  };

  return (
    <div className={styles.wrap}>
      <button className={styles.trigger} type="button" onClick={() => setOpen((current) => !current)}>
        <MapPin size={13} />
        <span>{shortLabel(location.label)}</span>
        <ChevronDown size={13} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button className={styles.backdrop} type="button" aria-label="Close location selector" onClick={() => setOpen(false)} />
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              <div className={styles.header}>
                <p className={styles.kicker}>Shopping around</p>
                <strong>{shortLabel(location.label)}</strong>
              </div>

              <button className={styles.gpsButton} type="button" onClick={detectLocation} disabled={detecting}>
                <LocateFixed size={15} />
                {detecting ? 'Detecting location...' : 'Use my current location'}
              </button>

              <label className={styles.searchBox}>
                <Search size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={stopEnterSubmit}
                  placeholder="Search any Indian locality"
                />
              </label>

              <div className={styles.radiusRow} aria-label="Search radius">
                {RADIUS_OPTIONS.map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    className={location.radiusKm === radius ? styles.activeRadius : ''}
                    onClick={() => setRadius(radius)}
                  >
                    {radius} km
                  </button>
                ))}
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.results}>
                {results.map((place) => (
                  <button key={`${place.lat}-${place.lng}-${place.label}`} type="button" onClick={() => chooseLocation(place)}>
                    <MapPin size={14} />
                    <span>{place.label}</span>
                  </button>
                ))}
              </div>

              <details className={styles.custom}>
                <summary>Use coordinates</summary>
                <div className={styles.coordGrid}>
                  <input value={lat} onChange={(event) => setLat(event.target.value)} onKeyDown={stopEnterSubmit} placeholder="Latitude" />
                  <input value={lng} onChange={(event) => setLng(event.target.value)} onKeyDown={stopEnterSubmit} placeholder="Longitude" />
                  <button type="button" onClick={applyCustomLocation}>Apply</button>
                </div>
              </details>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

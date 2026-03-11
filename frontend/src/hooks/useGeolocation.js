import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to capture browser geolocation.
 * - Auto-requests permission on mount.
 * - Returns { latitude, longitude, accuracy, loading, error, supported, retry }.
 * - Gracefully handles denied permission & unsupported browsers.
 */
const useGeolocation = (options = {}) => {
  const [position, setPosition] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supported = "geolocation" in navigator;

  const getPosition = useCallback(() => {
    if (!supported) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let message;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location permission denied. You can still submit without location.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case err.TIMEOUT:
            message = "Location request timed out.";
            break;
          default:
            message = "An unknown error occurred while fetching location.";
        }
        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // cache for 5 minutes
        ...options,
      }
    );
  }, [supported, options]);

  useEffect(() => {
    getPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...position,
    loading,
    error,
    supported,
    retry: getPosition,
  };
};

export default useGeolocation;

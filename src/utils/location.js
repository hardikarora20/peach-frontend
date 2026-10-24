import { prefs } from "./storage";

const CACHE_MS = 5 * 60 * 1000;

// Turn the browser's numeric geolocation error codes into something a person can act on.
function toFriendlyError(error) {
  switch (error?.code) {
    case 1:
      return new Error("Location permission is turned off. Allow location for this site and try again.");
    case 2:
      return new Error("We couldn't detect your location. Check your connection or GPS and try again.");
    case 3:
      return new Error("Getting your location took too long. Please try again.");
    default:
      return new Error(error?.message || "Location is unavailable on this device.");
  }
}

export function getCurrentLocation({ useCache = true } = {}) {
  return new Promise((resolve, reject) => {
    const cached = prefs.getLocation();
    if (useCache && cached?.latitude && cached?.longitude && Date.now() - cached.timestamp < CACHE_MS) {
      resolve({ latitude: cached.latitude, longitude: cached.longitude });
      return;
    }

    if (!("geolocation" in navigator)) {
      reject(new Error("This browser doesn't support location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        prefs.setLocation({ ...loc, timestamp: Date.now() });
        resolve(loc);
      },
      (err) => reject(toFriendlyError(err)),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  });
}

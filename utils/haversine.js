const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function findNearestHub(point, hubs) {
  if (!Array.isArray(hubs) || hubs.length === 0) return null;
  if (point == null || point.lat == null || point.lng == null) return null;

  let nearest = null;
  let shortest = Infinity;

  for (const hub of hubs) {
    if (hub.lat == null || hub.lng == null) continue;
    const distanceKm = haversineDistanceKm(point.lat, point.lng, hub.lat, hub.lng);
    if (distanceKm < shortest) {
      shortest = distanceKm;
      nearest = hub;
    }
  }

  if (!nearest) return null;
  return { hub: nearest, distanceKm: Math.round(shortest * 100) / 100 };
}

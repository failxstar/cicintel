/**
 * Distance Calculation Utilities
 * Haversine formula for calculating distances between GPS coordinates
 */

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param lat1 - Latitude of point 1 (in degrees)
 * @param lon1 - Longitude of point 1 (in degrees)
 * @param lat2 - Latitude of point 2 (in degrees)
 * @param lon2 - Longitude of point 2 (in degrees)
 * @returns Distance in kilometers
 * 
 * @example
 * const distance = calculateDistance(13.0827, 80.2707, 13.0878, 80.2785);
 * console.log(distance); // 0.95 km
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Round to 2 decimal places
    return Math.round(distance * 100) / 100;
}

/**
 * Format distance for display
 * 
 * @param km - Distance in kilometers
 * @returns Formatted string like "120 meters" or "2.5 km"
 * 
 * @example
 * formatDistance(0.12);  // "120 meters"
 * formatDistance(2.5);   // "2.5 km"
 * formatDistance(0.95);  // "950 meters"
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} meters`;
    }
    return `${km.toFixed(1)} km`;
}

/**
 * Calculate distance and return formatted string
 * 
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Formatted distance string
 * 
 * @example
 * getFormattedDistance(13.0827, 80.2707, 13.0878, 80.2785); // "950 meters"
 */
export function getFormattedDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): string {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return formatDistance(distance);
}

/**
 * Geographic Utilities for Distance Calculation
 * Implements Haversine formula for accurate distance calculation between coordinates
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Find the nearest infrastructure from a given point
 */
export function findNearestInfrastructure(
    point: Coordinates,
    infrastructures: Array<{ coordinates: Coordinates; name: string; type: string }>
): { distance: number; infrastructure: typeof infrastructures[0] } | null {
    if (!infrastructures.length) return null;

    let nearest = infrastructures[0];
    let minDistance = calculateDistance(point, nearest.coordinates);

    for (let i = 1; i < infrastructures.length; i++) {
        const distance = calculateDistance(point, infrastructures[i].coordinates);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = infrastructures[i];
        }
    }

    return { distance: minDistance, infrastructure: nearest };
}

/**
 * Check if a point is within a certain radius of any infrastructure
 */
export function isNearInfrastructure(
    point: Coordinates,
    infrastructures: Array<{ coordinates: Coordinates }>,
    radiusMeters: number
): boolean {
    return infrastructures.some(
        (infrastructure) => calculateDistance(point, infrastructure.coordinates) <= radiusMeters
    );
}

/**
 * Get all infrastructures within a certain radius
 */
export function getInfrastructuresWithinRadius(
    point: Coordinates,
    infrastructures: Array<{ coordinates: Coordinates; name: string; type: string }>,
    radiusMeters: number
): Array<{ distance: number; infrastructure: typeof infrastructures[0] }> {
    return infrastructures
        .map((infrastructure) => ({
            distance: calculateDistance(point, infrastructure.coordinates),
            infrastructure,
        }))
        .filter((item) => item.distance <= radiusMeters)
        .sort((a, b) => a.distance - b.distance);
}

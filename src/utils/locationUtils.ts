/**
 * Location Utilities
 * Distance calculations and location formatting helpers
 */

import { Coordinates } from './geoUtils';

/**
 * Format distance in a human-readable way
 * @param meters Distance in meters
 * @returns Formatted string like "350 meters away" or "2.5 km away"
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} meters away`;
    } else {
        const km = meters / 1000;
        return `${km.toFixed(1)} km away`;
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * This is a duplicate of the one in geoUtils but kept here for convenience
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistanceBetween(
    point1: Coordinates,
    point2: Coordinates
): number {
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
 * Get distance and formatted string between two points
 */
export function getDistanceInfo(
    from: Coordinates,
    to: Coordinates
): { meters: number; formatted: string } {
    const meters = calculateDistanceBetween(from, to);
    return {
        meters,
        formatted: formatDistance(meters),
    };
}

/**
 * Format coordinates for display
 * @param coords Coordinates to format
 * @returns Formatted string like "26.7271°N, 88.3953°E"
 */
export function formatCoordinates(coords: Coordinates): string {
    const latDir = coords.lat >= 0 ? 'N' : 'S';
    const lngDir = coords.lng >= 0 ? 'E' : 'W';
    return `${Math.abs(coords.lat).toFixed(4)}°${latDir}, ${Math.abs(coords.lng).toFixed(4)}°${lngDir}`;
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(coords: Coordinates): boolean {
    return (
        coords.lat >= -90 &&
        coords.lat <= 90 &&
        coords.lng >= -180 &&
        coords.lng <= 180 &&
        !isNaN(coords.lat) &&
        !isNaN(coords.lng)
    );
}

/**
 * Get rough address from coordinates (placeholder for reverse geocoding)
 * In production, this would call a reverse geocoding API
 */
export async function reverseGeocode(coords: Coordinates): Promise<string> {
    // Placeholder implementation
    // In production, use:
    // - Nominatim (OpenStreetMap): https://nominatim.openstreetmap.org/reverse
    // - Google Maps Geocoding API
    // - Mapbox Geocoding API

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        return data.display_name || 'Unknown location';
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    }
}

/**
 * Check if user is within a certain distance from a reference point
 */
export function isWithinRadius(
    userLocation: Coordinates,
    referencePoint: Coordinates,
    radiusMeters: number
): boolean {
    const distance = calculateDistanceBetween(userLocation, referencePoint);
    return distance <= radiusMeters;
}

/**
 * Get bearing between two points (direction in degrees)
 * 0° = North, 90° = East, 180° = South, 270° = West
 */
export function getBearing(from: Coordinates, to: Coordinates): number {
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
        Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    const bearing = ((θ * 180) / Math.PI + 360) % 360;

    return bearing;
}

/**
 * Get cardinal direction from bearing
 */
export function getCardinalDirection(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

/**
 * Get direction description between two points
 * Example: "350m to the Northeast"
 */
export function getDirectionDescription(
    from: Coordinates,
    to: Coordinates
): string {
    const distance = calculateDistanceBetween(from, to);
    const bearing = getBearing(from, to);
    const direction = getCardinalDirection(bearing);

    return `${formatDistance(distance)} to the ${direction}`;
}

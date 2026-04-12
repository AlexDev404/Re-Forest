import type { ReverseGeoJSON } from '@/types/geo';

const GEOCODE_API_KEY = import.meta.env.VITE_GEOCODE_API_KEY || '';

export async function getCurrentLocation(): Promise<GeolocationCoordinates | null> {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return position.coords;
  } catch (error) {
    alert('Error getting location: ' + (error instanceof Error ? error.message : String(error)));
    return null;
  }
}

export async function getReverseLoc(
  lat: number,
  lng: number,
  controller?: AbortController
): Promise<ReverseGeoJSON | null> {
  try {
    const response = await fetch(
      `https://geocode.maps.co/reverse?format=jsonv2&lat=${lat}&lon=${lng}&api_key=${GEOCODE_API_KEY}`,
      { signal: controller?.signal }
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export function metersToFeet(meters: number): string {
  return localStorage.getItem('units') === 'false'
    ? meters.toFixed(2) + ' metres'
    : (meters * 3.28084).toFixed(2) + ' ft';
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

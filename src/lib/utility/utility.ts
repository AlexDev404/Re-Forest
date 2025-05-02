import { PUBLIC_GEOCODE_API_KEY } from '$env/static/public';
import type { ReverseGeoJSON } from '$lib/types/GeoJSON';

export async function getCurrentLocation(
	currentLocation?: GeolocationCoordinates | null
): Promise<GeolocationCoordinates | null> {
	let location: GeolocationCoordinates | null = null;
	try {
		const position = await new Promise<GeolocationPosition>((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});
		location = position.coords;
		if (currentLocation) {
			currentLocation = location;
		}
		console.log('Current location:', location);
		return location;
	} catch (error) {
		alert('Error getting location: ' + (error instanceof Error ? error.message : String(error)));
	}
	return location;
}

export async function getReverseLoc(
	lat: number,
	lng: number,
	controller?: AbortController
): Promise<ReverseGeoJSON | null> {
	const response = await fetch(
		`https://geocode.maps.co/reverse?format=jsonv2&lat=${lat}&lon=${lng}&api_key=${PUBLIC_GEOCODE_API_KEY}`,
		{ signal: controller?.signal }
	);
	if (!response.ok) {
		return null;
	}
	const data: ReverseGeoJSON = await response.json();
	console.log(data);
	return data;
}

export function metersToFeet(meters: number) {
	return localStorage.getItem('units') === 'false'
		? meters.toFixed(2) + ' metres'
		: (meters * 3.28084).toFixed(2) + ' ft';
}

export // Format date to be more readable
function formatDate(dateString: string) {
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

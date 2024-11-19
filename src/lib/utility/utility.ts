import type { ReverseGeoJSON } from "$lib/types/GeoJSON";

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
		alert('Error getting location: ' + error.message);
	}
	return location;
}


export async function getReverseLoc(lat: number, lng: number): Promise<ReverseGeoJSON | null> {
	const response = await fetch(
		`https://geocode.maps.co/reverse?format=jsonv2&lat=${lat}&lon=${lng}&api_key=67383f9b5a5d8533348772gbf5de3c7`
	);
	if (!response.ok) {
		return null;
	}
	const data = await response.json();
	console.log(data);
	return data;
}
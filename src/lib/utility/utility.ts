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
		alert('Error getting location: ' + (error instanceof Error ? error.message : String(error)));
	}
	return location;
}


export async function getReverseLoc(lat: number, lng: number): Promise<ReverseGeoJSON | null> {
	try {
	  const response = await fetch(
		`https://geocode.maps.co/reverse?format=jsonv2&lat=${lat}&lon=${lng}&api_key=6813e77234df5427180036kpd7480e7`
	  );
	  if (!response.ok) return null;
	  const data: ReverseGeoJSON = await response.json();
	  return data;
	} catch (error) {
	  console.error('Reverse geolocation failed:', error);
	  return null;
	}
  }
  

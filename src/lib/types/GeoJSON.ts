export type GeoJSON = {
	type: 'FeatureCollection';
	features: Feature[];
};

export type Feature = {
	type: 'Feature';
	geometry: Geometry;
	properties: Properties;
};

export type Geometry = {
	type: 'Point';
	coordinates: [number, number];
};

export type Properties = {
	city?: string;
	country: string;
	name: string;
	postcode?: string;
	osm_id?: number;
	osm_type?: string;
	osm_key?: string;
	osm_value?: string;
	type?: string;
};

export type ReverseGeoJSON = {
	place_id: number;
	licence: string;
	osm_type: string;
	osm_id: number;
	lat: string;
	lon: string;
	place_rank: number;
	category: string;
	type: string;
	importance: number;
	addresstype: string;
	name: string;
	display_name: string;
	address: {
		office: string;
		house_number: string;
		road: string;
		city: string;
		state: string;
		'ISO3166-2-lvl4': string;
		postcode: string;
		country: string;
		country_code: string;
	};
	boundingbox: [string, string, string, string];
};

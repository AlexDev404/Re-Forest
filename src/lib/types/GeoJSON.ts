export type GeoJSON = {
    type: "FeatureCollection";
    features: Feature[];
};

export type Feature = {
    type: "Feature";
    geometry: Geometry;
    properties: Properties;
};

export type Geometry = {
    type: "Point";
    coordinates: [number, number];
};

export type Properties = {
    city?: string;
    country: string;
    name: string;
    postcode?: string;
};
export type SourceDataNode = {
    id: number;
    common_name: string;
    scientific_name: [number, string];
    other_name: [number, string];
    cycle: string;
    watering: string;
    sunlight: [number, string];
    default_image: {
        license: number;
        license_name: string;
        license_url: string;
        original_url: string;
        regular_url: string;
        medium_url: string;
        small_url: string;
        thumbnail: string;
    };
}

export type SourceData = {
    data: SourceDataNode[];
    from: number;
    to: number;
    per_page: number;
    current_page: number;
    last_page: number;
    total: number;
}
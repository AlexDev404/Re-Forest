export interface ApiUser {
  Id: number;
  Role: number | null;
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  Password: string | null;
  CreatedAt: Date | null;
}

export interface SafeApiUser {
  Id: number;
  Role: number | null;
  FirstName: string | null;
  LastName: string | null;
  CreatedAt: Date | null;
}

export interface TreeData {
  name: string | null;
  health: string;
  plantedBy: string;
  plantedOn: string | null;
  lat: number | null;
  lng: number | null;
  image: string;
  description: string;
  height: string;
  age: string;
  location_readable: undefined;
}

export interface ReportData {
  title: string;
  data: { label: string; value: number }[];
  columns: string[];
  colors?: string[];
}

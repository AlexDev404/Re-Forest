import { api } from './client';

export interface TreeData {
  name: string;
  health: string;
  plantedBy: string;
  plantedOn: string | null;
  lat: number | null;
  lng: number | null;
  image: string;
  description: string;
  height: string;
  age: string;
  location_readable?: string;
}

export interface ApprovedTree {
  Id: number;
  TreeName: string | null;
  TreeSpecies: number | null;
  Height: number | null;
  Health: string | null;
  Age: number | null;
  Image: string | null;
  Lat: number | null;
  Lng: number | null;
  PlantedBy: {
    Id: number;
    Role: number | null;
    FirstName: string | null;
    LastName: string | null;
    CreatedAt: string | null;
  } | null;
  PlantedOn: string | null;
  CreatedAt: string | null;
  UpdatedAt: string | null;
}

export interface TreeCreateData {
  tree_name: string;
  tree_image: string;
  tree_lat: number;
  tree_lng: number;
  tree_height?: number;
  tree_age?: number;
  tree_species: string;
  planter_type: 'INDIVIDUAL' | 'ORGANIZATION';
  organization_name?: string;
  planting_reason_id?: string;
  hashtags?: string;
  quantity?: number;
  area_hectares?: number;
}

export interface BatchTreeEntry {
  tree_name: string;
  tree_species: string;
  tree_height?: number;
  tree_age?: number;
  tree_image: string;
  tree_lat: number;
  tree_lng: number;
  planter_type: 'INDIVIDUAL' | 'ORGANIZATION';
  organization_name?: string | null;
  planting_reason_id?: string;
  hashtags?: string | null;
  quantity?: number;
  area_hectares?: number | null;
}

export interface TreeSpeciesData {
  id: number;
  name: string;
}

export interface PlantingReason {
  Id: number;
  Name: string;
  CreatedAt: string | null;
}

export const treesAdapter = {
  async getFiltered(params: {
    q?: string;
    health?: string;
    date?: string;
    height?: string;
  }): Promise<TreeData[]> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.health) searchParams.set('health', params.health);
    if (params.date) searchParams.set('date', params.date);
    if (params.height) searchParams.set('height', params.height);
    return api.get<TreeData[]>(`/trees?${searchParams.toString()}`);
  },

  async getApproved(): Promise<{ trees: ApprovedTree[] }> {
    return api.get('/trees/approved');
  },

  async create(data: TreeCreateData): Promise<{ success: boolean; treeId: number }> {
    return api.post('/trees', data);
  },

  async batchCreate(
    trees: BatchTreeEntry[]
  ): Promise<{ success: boolean; message: string; treeIds: number[] }> {
    return api.post('/trees/batch', { trees });
  },

  async delete(id: number): Promise<{ success: boolean }> {
    return api.delete(`/trees/${id}`);
  },

  async getSpecies(params: {
    q?: string;
    limit?: number;
    is_timber?: string;
  }): Promise<{ species: TreeSpeciesData[] }> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.is_timber !== undefined) searchParams.set('is_timber', params.is_timber);
    return api.get(`/tree-species?${searchParams.toString()}`);
  },

  async getPlantingReasons(): Promise<{ plantingReasons: PlantingReason[] }> {
    return api.get('/planting-reasons');
  }
};

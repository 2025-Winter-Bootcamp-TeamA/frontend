export type LocationArea = "강남" | "판교";

export interface Company {
  id: string;
  name: string;
  industry: string;
  logoUrl: string;
  address: string;
  latitude: number;
  longitude: number;
  area: LocationArea;
  description?: string;
  siteUrl?: string;
  isFavorite: boolean;
}

export interface MapMarker {
  id: string;
  companyId: string;
  latitude: number;
  longitude: number;
}

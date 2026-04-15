export interface Prospect {
  id?: number;
  name: string;
  phone: string;
  neighborhood: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  interestLevel: number; // 1-5
  appointmentDate: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type SortField = 'neighborhood' | 'interestLevel' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

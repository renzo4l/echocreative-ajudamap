export type PointCategory = 
  | 'ecoponto'
  | 'bazar'
  | 'doacao'
  | 'reciclagem'
  | 'asilo';

export interface LocationPoint {
  id: string;
  name: string;
  category: PointCategory;
  categoryLabel: string;
  address: string;
  neighborhood: string;
  city: string; // São Luís
  lat: number;
  lng: number;
  hours: string;
  phone?: string;
  whatsapp?: string;
  description: string;
  acceptedItems: string[];
  tips?: string;
  verified: boolean;
  isCommunityAdded?: boolean;
}

export interface MaterialOption {
  id: string;
  name: string;
  iconName: string;
  category: string;
  description: string;
}

export interface Campaign {
  id: string;
  title: string;
  organizer: string;
  neighborhood: string;
  category: PointCategory;
  goal: string;
  currentProgress: number;
  urgency: 'alta' | 'media' | 'continua';
  description: string;
  contact: string;
  dueDate: string;
}

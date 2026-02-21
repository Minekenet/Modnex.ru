
export interface FilterOption {
  label: string;
  options: string[];
  is_preview?: boolean;
  preview_limit?: number;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  cover_url?: string;
  stats?: any;
  modCount: string;
  downloadCount: string;
  categories: string[];
  filters: FilterOption[];
  price?: string;
  partnerName?: string;
  view_config?: any;
}

export type Category = 'моды' | 'плагины' | 'сейвы' | 'текстуры' | 'аддоны' | 'карты';

export type ViewType = 'grid' | 'compact' | 'list' | 'skin';
export type DetailsType = 'standard' | 'skin' | 'map';
export type CreationType = 'standard' | 'skin' | 'simple';

export interface SectionConfig {
  viewType?: ViewType;
  allowed_layouts?: ('grid' | 'compact' | 'list' | 'skin')[];
  detailsType?: DetailsType;
  creationType?: CreationType;
  defaultViewMode?: 'grid' | 'compact' | 'list';
  badgeFields?: string[];
  badgeMax?: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  author_id: string;
  author_name?: string;
  section_id: string;
  game_slug: string;
  section_slug: string;
  attributes: Record<string, any>;
  stats: {
    downloads: number;
    likes: number;
    views: number;
  };
  created_at: string;
  updated_at: string;
  banner_url?: string;
  gallery?: string[];
}

export interface GameViewConfig {
  sections: Record<string, SectionConfig>;
  defaultConfig: SectionConfig;
}

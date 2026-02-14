
export interface FilterOption {
  label: string;
  options: string[];
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  modCount: string;
  downloadCount: string;
  categories: string[];
  filters: FilterOption[];
  price?: string;
  partnerName?: string;
}

export type Category = 'моды' | 'плагины' | 'сейвы' | 'текстуры' | 'аддоны' | 'карты';

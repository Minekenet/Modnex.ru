
import { Game } from './types';

export const GAMES_DATA: Game[] = [
  { 
    id: '1', 
    slug: 'minecraft',
    title: 'Minecraft', 
    imageUrl: 'https://hot.game/uploads/media/game/0002/50/thumb_149421_game_poster2.jpeg', 
    modCount: '253.6K', 
    downloadCount: '100.9B',
    categories: [
      'Mods', 'Resource Packs', 'Data Packs', 'Shaders', 
      'Modpacks', 'Plugins', 'Scripts', 'Server Files', 
      'Tutorials', 'World Saves', 'Skins', 'Tools'
    ],
    filters: [
      { 
        label: 'Версия игры', 
        options: [
          '1.21.1', '1.21.0', '1.20.6', '1.20.4', '1.20.1', 
          '1.19.4', '1.19.2', '1.18.2', '1.17.1', '1.16.5', 
          '1.15.2', '1.14.4', '1.12.2', '1.8.9'
        ] 
      },
      { label: 'Загрузчик', options: ['Forge', 'Fabric', 'NeoForge', 'Quilt'] }
    ],
    price: '1 490 ₽',
    partnerName: 'Playerok'
  },
  { 
    id: '2', 
    slug: 'path-of-exile-2',
    title: 'Path of Exile 2', 
    imageUrl: 'https://picsum.photos/seed/poe2_poster/400/600', 
    modCount: '12.4K', 
    downloadCount: '800M',
    categories: ['Mods', 'Filters', 'Tools'],
    filters: [{ label: 'League', options: ['Standard', 'Settlers'] }]
  },
  { 
    id: '3', 
    slug: 'efootball-2025',
    title: 'eFootball 2025', 
    imageUrl: 'https://picsum.photos/seed/efootball/400/600', 
    modCount: '5.2K', 
    downloadCount: '120M',
    categories: ['Patches', 'Faces', 'Kits'],
    filters: [{ label: 'Platform', options: ['PC', 'PS5'] }]
  },
  { 
    id: '4', 
    slug: 'world-of-warcraft',
    title: 'World of Warcraft', 
    imageUrl: 'https://picsum.photos/seed/wow_poster/400/600', 
    modCount: '85.1K', 
    downloadCount: '12.5B',
    categories: ['Addons', 'UI Scale', 'WeakAuras'],
    filters: [{ label: 'Version', options: ['Retail', 'Classic', 'Hardcore'] }]
  },
  { 
    id: '5', 
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077', 
    imageUrl: 'https://picsum.photos/seed/cp2077/400/600', 
    modCount: '64.2K', 
    downloadCount: '1.2B',
    categories: ['Mods', 'Saves', 'Scripts'],
    filters: [{ label: 'Engine', options: ['REDmod', 'CET'] }]
  },
  { 
    id: '6', 
    slug: 'the-witcher-3',
    title: 'The Witcher 3', 
    imageUrl: 'https://picsum.photos/seed/witcher/400/600', 
    modCount: '45.1K', 
    downloadCount: '500M',
    categories: ['Mods', 'Saves', 'Visuals', 'Tools'],
    filters: [
      { label: 'Издание', options: ['Next-Gen', 'Classic v1.32'] },
      { label: 'Категория', options: ['Геймплей', 'Персонажи', 'Интерфейс'] }
    ],
    price: '450 ₽',
    partnerName: 'Sel.gg'
  },
  { 
    id: '7', 
    slug: 'stardew-valley',
    title: 'Stardew Valley', 
    imageUrl: 'https://picsum.photos/seed/stardew/400/600', 
    modCount: '18.9K', 
    downloadCount: '340M',
    categories: ['Mods', 'Portraits', 'Maps'],
    filters: [{ label: 'Requirement', options: ['SMAPI', 'Content Patcher'] }]
  },
  { 
    id: '8', 
    slug: 'skyrim-se',
    title: 'Skyrim Special Edition', 
    imageUrl: 'https://picsum.photos/seed/skyrim/400/600', 
    modCount: '125.2K', 
    downloadCount: '4.2B',
    categories: ['Mods', 'Collections', 'Media', 'Animations', 'ENB'],
    filters: [
      { label: 'Требования', options: ['SKSE', 'Address Library'] },
      { label: 'Тип файлов', options: ['ESP/ESM', 'ESL', 'Replacer'] }
    ],
    price: '799 ₽',
    partnerName: 'GGSel'
  },
  { 
    id: '9', 
    slug: 'gta-v',
    title: 'Grand Theft Auto V', 
    imageUrl: 'https://picsum.photos/seed/gtav/400/600', 
    modCount: '92.4K', 
    downloadCount: '8.9B',
    categories: ['Scripts', 'Vehicles', 'Skins'],
    filters: [{ label: 'Type', options: ['Singleplayer', 'FiveM'] }]
  },
  { 
    id: '10', 
    slug: 'terraria',
    title: 'Terraria', 
    imageUrl: 'https://picsum.photos/seed/terraria/400/600', 
    modCount: '22.4K', 
    downloadCount: '1.5B',
    categories: ['Mods', 'Maps', 'Texture Packs'],
    filters: [
      { label: 'tModLoader', options: ['v2024.x', 'v1.4.4', 'v1.3 Legacy'] }
    ],
    price: '249 ₽',
    partnerName: 'Playerok'
  },
  { 
    id: '11', 
    slug: 'rust',
    title: 'Rust', 
    imageUrl: 'https://picsum.photos/seed/rust_game/400/600', 
    modCount: '8.1K', 
    downloadCount: '450M',
    categories: ['Maps', 'Skins', 'Plugins'],
    filters: [{ label: 'Server', options: ['Official', 'Modded'] }]
  },
  { 
    id: '12', 
    slug: 'pubg',
    title: 'PUBG', 
    imageUrl: 'https://picsum.photos/seed/pubg_game/400/600', 
    modCount: '3.4K', 
    downloadCount: '2.1B',
    categories: ['Skins', 'Configs', 'Replays'],
    filters: [{ label: 'Region', options: ['Global', 'Asia'] }]
  }
];

export const ROTATING_WORDS = ['моды', 'плагины', 'сейвы', 'текстуры', 'аддоны', 'карты'];

export const DEFAULT_GAME_CONFIG = {
  categories: ['Mods', 'Collections', 'Media'],
  filters: [
    { label: 'Сортировать по', options: ['Популярные', 'Новые', 'Обновленные'] }
  ]
};

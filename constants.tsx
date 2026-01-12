
import { DrinkVariant } from './types';

export const DRINK_VARIANTS: DrinkVariant[] = [
  {
    id: 1,
    name: "CAMPA",
    subtitle: "COLA",
    description: "A modern take on a classic soda with a perfect blend of sweet and tart, full of nostalgic flavor. Feel fresh, Indian drink.",
    themeColor: "#E31837", // Classic Red
    baseUrl: "https://ngxhamxmygjbzxrruxcz.supabase.co/storage/v1/object/public/Cola%20frames/frame_",
    frameCount: 240,
  },
  {
    id: 2,
    name: "CAMPA",
    subtitle: "LIME",
    description: "A modern functional soda brand inspired by classic flavors but made with better ingredients. Bright, crisp, and refreshing.",
    themeColor: "#8BC34A", // Lime Green
    baseUrl: "https://ngxhamxmygjbzxrruxcz.supabase.co/storage/v1/object/public/Lime%20frames/frame_",
    frameCount: 240,
  },
  {
    id: 3,
    name: "CAMPA",
    subtitle: "ORANGE",
    description: "Bright and refreshing citrus soda with natural lemon spark and crisp bubbles. The sun-drenched flavor of pure orange.",
    themeColor: "#FF9800", // Orange
    baseUrl: "https://ngxhamxmygjbzxrruxcz.supabase.co/storage/v1/object/public/Orange%20frames/frame_",
    frameCount: 240,
  }
];

export const NAV_LINKS = [
  { name: 'Product', href: '#product' },
  { name: 'Ingredients', href: '#ingredients' },
  { name: 'Nutrition', href: '#nutrition' },
  { name: 'Reviews', href: '#reviews' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' },
];

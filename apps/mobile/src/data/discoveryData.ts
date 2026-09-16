export interface DiscoveryItem {
  id: string;
  name: string;
  category: 'herbs' | 'foods' | 'tips';
  categoryLabel: string;
  badgeColor: string;
  benefit: string;
  tags: string[];
  iconName: 'Leaf' | 'Flower2' | 'Flame' | 'Droplets' | 'Coffee' | 'Heart' | 'Activity' | 'Users' | 'Sparkles' | 'Eye';
}

export const DISCOVERY_ITEMS: DiscoveryItem[] = [
  // Ethiopian & Global Herbs
  {
    id: 'damakesse',
    name: 'Damakesse',
    category: 'herbs',
    categoryLabel: 'Ethiopian Herb',
    badgeColor: '#16a34a',
    benefit: 'Traditional Ethiopian remedy for severe headaches, sinus relief, and cold recovery.',
    tags: ['ethiopian', 'flu', 'headache'],
    iconName: 'Leaf'
  },
  {
    id: 'moringa',
    name: 'Moringa (Shiferaw)',
    category: 'herbs',
    categoryLabel: 'Superfood Herb',
    badgeColor: '#15803d',
    benefit: 'Rich in vital antioxidants, vitamins, and minerals that boost natural stamina and immunity.',
    tags: ['ethiopian', 'energy', 'superfood'],
    iconName: 'Sparkles'
  },
  {
    id: 'koso',
    name: 'Koso (Hagenia)',
    category: 'herbs',
    categoryLabel: 'Traditional Plant',
    badgeColor: '#059669',
    benefit: 'Historic medicinal flora renowned for internal cleansing and gastrointestinal resilience.',
    tags: ['ethiopian', 'cleansing', 'traditional'],
    iconName: 'Leaf'
  },
  {
    id: 'chamomile',
    name: 'Chamomile',
    category: 'herbs',
    categoryLabel: 'Calming Herb',
    badgeColor: '#ca8a04',
    benefit: 'Naturally triggers mild sedation, reducing sleep onset latency and nervous tension.',
    tags: ['sleep', 'calm', 'tea'],
    iconName: 'Flower2'
  },
  {
    id: 'tena-adam',
    name: 'Tena Adam (Rue)',
    category: 'herbs',
    categoryLabel: 'Ethiopian Herb',
    badgeColor: '#16a34a',
    benefit: 'Infused in traditional Ethiopian coffee to relieve mild spasms and soothe upset stomachs.',
    tags: ['ethiopian', 'pain-relief', 'herb'],
    iconName: 'Leaf'
  },
  {
    id: 'ginger',
    name: 'Ginger Root',
    category: 'herbs',
    categoryLabel: 'Vitality Spice',
    badgeColor: '#ea580c',
    benefit: 'High gingerol content stimulates digestive enzymes and alleviates motion or morning nausea.',
    tags: ['digestion', 'immunity', 'spice'],
    iconName: 'Flame'
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    category: 'herbs',
    categoryLabel: 'Adaptogen',
    badgeColor: '#9333ea',
    benefit: 'Balances cortisol pathways to modulate daily stress and foster nervous system recovery.',
    tags: ['stress', 'sleep', 'adaptogen'],
    iconName: 'Leaf'
  },

  // Ethiopian Superfoods & Nutrition
  {
    id: 'red-teff',
    name: 'Red Teff',
    category: 'foods',
    categoryLabel: 'Ancient Grain',
    badgeColor: '#b45309',
    benefit: 'Naturally gluten-free grain loaded with slow-release iron, calcium, and complex proteins.',
    tags: ['ethiopian', 'iron', 'grain'],
    iconName: 'Heart'
  },
  {
    id: 'beso',
    name: 'Beso (Roasted Barley)',
    category: 'foods',
    categoryLabel: 'Energy Breakfast',
    badgeColor: '#d97706',
    benefit: 'Gentle on digestion and provides sustained carbohydrate fuel without blood glucose spikes.',
    tags: ['ethiopian', 'energy', 'breakfast'],
    iconName: 'Coffee'
  },
  {
    id: 'telba',
    name: 'Telba (Flaxseed Drink)',
    category: 'foods',
    categoryLabel: 'Omega-3 Elixir',
    badgeColor: '#0284c7',
    benefit: 'Packed with plant-based Omega-3s and soluble lignans supporting cardiovascular and bowel motility.',
    tags: ['ethiopian', 'heart', 'omega3'],
    iconName: 'Droplets'
  },
  {
    id: 'shiro',
    name: 'Shiro (Chickpea Stew)',
    category: 'foods',
    categoryLabel: 'Plant Protein',
    badgeColor: '#c2410c',
    benefit: 'High in bioavailable dietary fiber and legume protein, a pillar of balanced plant nutrition.',
    tags: ['ethiopian', 'protein', 'nutrition'],
    iconName: 'Flame'
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'foods',
    categoryLabel: 'Healthy Fats',
    badgeColor: '#15803d',
    benefit: 'Monounsaturated oleic acid enhances nutrient absorption and promotes vascular elasticity.',
    tags: ['heart', 'fats', 'skin'],
    iconName: 'Heart'
  },

  // Daily Habits & Science-backed Tips
  {
    id: 'morning-hydration',
    name: 'Morning Hydration',
    category: 'tips',
    categoryLabel: 'Daily Habit',
    badgeColor: '#0284c7',
    benefit: '500ml water before coffee awakens gut peristalsis and rehydrates cellular mitochondria.',
    tags: ['morning', 'hydration', 'metabolism'],
    iconName: 'Droplets'
  },
  {
    id: '20-20-20-rule',
    name: '20-20-20 Rule',
    category: 'tips',
    categoryLabel: 'Vision Health',
    badgeColor: '#4f46e5',
    benefit: 'Every 20 mins of screen time, gaze at an object 20 feet away for 20 seconds to prevent eye fatigue.',
    tags: ['eyes', 'focus', 'digital-health'],
    iconName: 'Eye'
  },
  {
    id: 'deep-breathing',
    name: 'Diaphragmatic Breathing',
    category: 'tips',
    categoryLabel: 'Nervous System',
    badgeColor: '#7c3aed',
    benefit: '5 rhythmic physiological sighs or deep belly breaths down-regulate acute sympathetic stress.',
    tags: ['stress', 'breathing', 'calm'],
    iconName: 'Activity'
  },
  {
    id: 'gebeta',
    name: 'Gebeta (Shared Meals)',
    category: 'tips',
    categoryLabel: 'Social Wellness',
    badgeColor: '#db2777',
    benefit: 'Communal meal gatherings elevate oxytocin and reduce chronic loneliness biomarkers.',
    tags: ['ethiopian', 'social', 'mental-health'],
    iconName: 'Users'
  }
];

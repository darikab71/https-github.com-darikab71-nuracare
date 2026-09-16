export interface DiscoveryItem {
  id: string;
  name: string;
  category: 'herbs' | 'foods' | 'tips';
  categoryLabel: string;
  badgeColor: string;
  benefit: string;
  preparation?: string;
  tags: string[];
  iconName: 'Leaf' | 'Flower2' | 'Flame' | 'Droplets' | 'Coffee' | 'Heart' | 'Activity' | 'Users' | 'Sparkles' | 'Eye';
  image: string;
}

export const DISCOVERY_ITEMS: DiscoveryItem[] = [
  // Ethiopian & Global Herbs
  {
    id: 'damakesse',
    name: 'Damakesse (Ocimum lamiifolium)',
    category: 'herbs',
    categoryLabel: 'Ethiopian Herb',
    badgeColor: '#16a34a',
    benefit: 'Traditional Ethiopian remedy for severe headaches, sinus congestion, and influenza relief.',
    preparation: 'Crush fresh leaves and inhale the steam infusion, or steep in warm water for a soothing herbal vapor.',
    tags: ['ethiopian', 'flu', 'headache', 'respiratory'],
    iconName: 'Leaf',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Ocimum_tenuiflorum3.jpg/500px-Ocimum_tenuiflorum3.jpg'
  },
  {
    id: 'moringa',
    name: 'Moringa (Shiferaw)',
    category: 'herbs',
    categoryLabel: 'Superfood Herb',
    badgeColor: '#15803d',
    benefit: 'Packed with 46 antioxidants, 9 essential amino acids, and high bioavailable iron for sustained vitality.',
    preparation: 'Mix 1 teaspoon of dried leaf powder into warm lemon water, smoothies, or sprinkle onto traditional lentil dishes.',
    tags: ['ethiopian', 'energy', 'superfood', 'immunity'],
    iconName: 'Sparkles',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/DrumstickFlower.jpg/500px-DrumstickFlower.jpg'
  },
  {
    id: 'tena-adam',
    name: 'Tena Adam (Rue / Ruta chalepensis)',
    category: 'herbs',
    categoryLabel: 'Ethiopian Herb',
    badgeColor: '#16a34a',
    benefit: 'Infused into traditional Ethiopian coffee to relieve abdominal cramps, nausea, and tension headaches.',
    preparation: 'Dip a fresh twig into freshly brewed Buna (coffee) for 15–30 seconds to extract volatile medicinal oils.',
    tags: ['ethiopian', 'digestion', 'coffee', 'herb'],
    iconName: 'Leaf',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ruta_chalepensis_flowers.jpg/500px-Ruta_chalepensis_flowers.jpg'
  },
  {
    id: 'koso',
    name: 'Koso (Hagenia abyssinica)',
    category: 'herbs',
    categoryLabel: 'Traditional Flora',
    badgeColor: '#059669',
    benefit: 'Historic Ethiopian highland tree flower famed for its potent gut-cleansing and anti-parasitic properties.',
    preparation: 'Traditionally consumed in mild regulated infusions under elder or herbalist guidance during cleansing cycles.',
    tags: ['ethiopian', 'cleansing', 'traditional'],
    iconName: 'Leaf',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Hagenia_abyssinica_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-208.jpg'
  },
  {
    id: 'qerenfud',
    name: 'Cloves (Qerenfud)',
    category: 'herbs',
    categoryLabel: 'Spiced Herb',
    badgeColor: '#b45309',
    benefit: 'Contains high eugenol concentrations providing natural oral analgesic and antimicrobial defense.',
    preparation: 'Simmer 2-3 whole cloves in herbal tea or warm water for 5 minutes after meals.',
    tags: ['ethiopian', 'inflammation', 'spice', 'oral-health'],
    iconName: 'Sparkles',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Cloves_Dried_Flower_Buds.jpg/500px-Cloves_Dried_Flower_Buds.jpg'
  },
  {
    id: 'korerima',
    name: 'Korerima (Black Cardamom)',
    category: 'herbs',
    categoryLabel: 'Highland Spice',
    badgeColor: '#78350f',
    benefit: 'Indigenous Ethiopian spice with carminative properties that calm gastrointestinal distress and bloating.',
    preparation: 'Crush the pod seeds and infuse into stews, ginger brews, or hot spiced tea.',
    tags: ['ethiopian', 'digestion', 'spice'],
    iconName: 'Flame',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Aframomum_corrorima.jpg/500px-Aframomum_corrorima.jpg'
  },
  {
    id: 'abish',
    name: 'Abish (Fenugreek)',
    category: 'herbs',
    categoryLabel: 'Metabolic Herb',
    badgeColor: '#0284c7',
    benefit: 'Clinically shown to support glucose metabolism, digestive enzyme production, and lactation.',
    preparation: 'Whisk ground fenugreek with water until frothy, or soak whole seeds overnight to drink the tonic water.',
    tags: ['ethiopian', 'digestion', 'blood-sugar'],
    iconName: 'Droplets',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Trigonella_foenum-graecum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-274.jpg/500px-Trigonella_foenum-graecum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-274.jpg'
  },
  {
    id: 'chamomile',
    name: 'Chamomile (Matricaria)',
    category: 'herbs',
    categoryLabel: 'Calming Herb',
    badgeColor: '#ca8a04',
    benefit: 'Apigenin flavonoid binds to GABA receptors, calming neural excitability and improving restorative sleep.',
    preparation: 'Steep whole dried chamomile flowers in 95°C water for 7–10 minutes 45 minutes before sleep.',
    tags: ['sleep', 'calm', 'tea'],
    iconName: 'Flower2',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Kamomillasaunio_%28Matricaria_recutita%29.JPG/500px-Kamomillasaunio_%28Matricaria_recutita%29.JPG'
  },
  {
    id: 'ginger',
    name: 'Ginger Root (Zingiber)',
    category: 'herbs',
    categoryLabel: 'Vitality Spice',
    badgeColor: '#ea580c',
    benefit: 'Gingerols enhance gastric motility, accelerate digestion, and suppress inflammatory cytokines.',
    preparation: 'Boil freshly sliced ginger root in water for 10 minutes with a squeeze of fresh lemon and honey.',
    tags: ['digestion', 'immunity', 'spice'],
    iconName: 'Flame',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Ginger_roots.jpg/500px-Ginger_roots.jpg'
  },
  {
    id: 'peppermint',
    name: 'Peppermint (Mentha)',
    category: 'herbs',
    categoryLabel: 'Digestive Herb',
    badgeColor: '#059669',
    benefit: 'Menthol calms visceral sensory receptors, relieving abdominal bloating and tension headaches.',
    preparation: 'Crush fresh peppermint leaves into steaming water for a soothing after-dinner tea.',
    tags: ['digestion', 'headache', 'tea'],
    iconName: 'Leaf',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pfefferminze_natur_peppermint.jpg/500px-Pfefferminze_natur_peppermint.jpg'
  },
  {
    id: 'echinacea',
    name: 'Echinacea (Purple Coneflower)',
    category: 'herbs',
    categoryLabel: 'Immune Defense',
    badgeColor: '#7c3aed',
    benefit: 'Alkylamides activate white blood cell defense and reduce duration of cold and throat symptoms.',
    preparation: 'Steep 1 tablespoon dried flowers in hot water or take as certified tincture at first sign of chills.',
    tags: ['immunity', 'cold', 'herb'],
    iconName: 'Flower2',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/EchinaceaPurpureaMaxima1a.UME.JPG/500px-EchinaceaPurpureaMaxima1a.UME.JPG'
  },
  {
    id: 'turmeric',
    name: 'Turmeric (Curcumin)',
    category: 'herbs',
    categoryLabel: 'Anti-Inflammatory',
    badgeColor: '#d97706',
    benefit: 'Potent polyphenol that downregulates NF-kB inflammatory cascades and supports joint mobility.',
    preparation: 'Combine with a pinch of black pepper (piperine) in warm almond or oat milk to enhance absorption by 2000%.',
    tags: ['inflammation', 'immunity', 'joints'],
    iconName: 'Sparkles',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Curcuma_longa_roots.jpg/500px-Curcuma_longa_roots.jpg'
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha (Withania)',
    category: 'herbs',
    categoryLabel: 'Adaptogen',
    badgeColor: '#9333ea',
    benefit: 'Regulates hypothalamic-pituitary-adrenal (HPA) axis to normalize cortisol spikes during high cognitive strain.',
    preparation: 'Consume 300-500mg root extract in warm evening milk or herbal tea.',
    tags: ['stress', 'sleep', 'adaptogen'],
    iconName: 'Leaf',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/WithaniaFruit.jpg/500px-WithaniaFruit.jpg'
  },

  // Ethiopian Superfoods & Nutrition
  {
    id: 'red-teff',
    name: 'Red Teff (Eragrostis tef)',
    category: 'foods',
    categoryLabel: 'Ancient Grain',
    badgeColor: '#b45309',
    benefit: 'Ancient grain rich in slow-burning prebiotics, resistant starch, iron, and complete essential amino acids.',
    preparation: 'Fermented into Injera over 3 days to unlock beneficial lactic acid bacteria and maximize nutrient bioavailability.',
    tags: ['ethiopian', 'iron', 'grain', 'gut-health'],
    iconName: 'Heart',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Teff_-_Eragrostis_tef.jpg/500px-Teff_-_Eragrostis_tef.jpg'
  },
  {
    id: 'beso',
    name: 'Beso (Roasted Barley)',
    category: 'foods',
    categoryLabel: 'Energy Breakfast',
    badgeColor: '#d97706',
    benefit: 'Complex beta-glucan fibers curb afternoon fatigue and foster healthy intestinal microbiome flora.',
    preparation: 'Stir 2 tablespoons of roasted barley flour into cold water or buttermilk with a touch of honey for quick fuel.',
    tags: ['ethiopian', 'energy', 'breakfast', 'gut'],
    iconName: 'Coffee',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Hordeum-vulgare.jpg/500px-Hordeum-vulgare.jpg'
  },
  {
    id: 'telba',
    name: 'Telba (Flaxseed Drink)',
    category: 'foods',
    categoryLabel: 'Omega-3 Elixir',
    badgeColor: '#0284c7',
    benefit: 'Plant-based alpha-linolenic acid (ALA) supports arterial flexibility and coats gastric mucous membranes.',
    preparation: 'Lightly roast whole brown flaxseeds, grind into powder, and blend with warm water and a dash of cinnamon.',
    tags: ['ethiopian', 'heart', 'omega3', 'digestion'],
    iconName: 'Droplets',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Linum_usitatissimum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-090.jpg/500px-Linum_usitatissimum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-090.jpg'
  },
  {
    id: 'shiro',
    name: 'Shiro (Chickpea Stew)',
    category: 'foods',
    categoryLabel: 'Plant Protein',
    badgeColor: '#c2410c',
    benefit: 'High-protein chickpea and broad bean stew seasoned with healing garlic, ginger, and Ethiopian spices.',
    preparation: 'Slow-simmered with onions, berbere, and cold-pressed oil, paired with Injera for complete protein synthesis.',
    tags: ['ethiopian', 'protein', 'nutrition', 'tsom'],
    iconName: 'Flame',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Chickpeas.jpg/500px-Chickpeas.jpg'
  },
  {
    id: 'avocado',
    name: 'Avocado (Persea)',
    category: 'foods',
    categoryLabel: 'Healthy Fats',
    badgeColor: '#15803d',
    benefit: 'Heart-healthy monounsaturated fats that aid in the absorption of fat-soluble vitamins A, D, E, and K.',
    preparation: 'Slice fresh onto salads, blend into morning smoothies, or enjoy with fresh lime juice and chili.',
    tags: ['heart', 'fats', 'skin'],
    iconName: 'Heart',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80'
  },

  // Daily Habits & Science-backed Tips
  {
    id: 'morning-hydration',
    name: 'Morning Hydration Protocol',
    category: 'tips',
    categoryLabel: 'Daily Habit',
    badgeColor: '#0284c7',
    benefit: '500ml of room-temperature water upon waking activates gastrointestinal motility and rehydrates kidneys.',
    preparation: 'Drink before caffeine or food; optionally add a slice of lemon and a pinch of unrefined sea salt.',
    tags: ['morning', 'hydration', 'metabolism'],
    iconName: 'Droplets',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '20-20-20-rule',
    name: 'The 20-20-20 Visual Rest',
    category: 'tips',
    categoryLabel: 'Vision Care',
    badgeColor: '#4f46e5',
    benefit: 'Relaxes ciliary eye muscles, restores tear film distribution, and diminishes digital screen headaches.',
    preparation: 'Every 20 minutes of screen work, look at an object 20 feet (6 meters) away for 20 continuous seconds.',
    tags: ['eyes', 'focus', 'digital-health'],
    iconName: 'Eye',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'deep-breathing',
    name: 'Physiological Sigh & Belly Breathing',
    category: 'tips',
    categoryLabel: 'Nervous System',
    badgeColor: '#7c3aed',
    benefit: 'Two quick nasal inhales followed by an extended oral exhale immediately activates vagal parasympathetic tone.',
    preparation: 'Perform 3-5 cycles whenever feeling acute deadline tension or mental overwhelm.',
    tags: ['stress', 'breathing', 'calm', 'nervous-system'],
    iconName: 'Activity',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'gebeta',
    name: 'Gebeta (Mindful Communal Eating)',
    category: 'tips',
    categoryLabel: 'Social Longevity',
    badgeColor: '#db2777',
    benefit: 'Shared meal rituals slow eating cadence, enhance parasympathetic digestion, and reduce isolation stress.',
    preparation: 'Gather with family or friends around a shared plate without phones or screens.',
    tags: ['ethiopian', 'social', 'mental-health', 'longevity'],
    iconName: 'Users',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80'
  }
];

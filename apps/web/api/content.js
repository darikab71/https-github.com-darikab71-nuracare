/**
 * NuraCare Server-Driven Lifestyle Content API
 * Vercel Edge / Serverless Function — /api/content
 *
 * Supplies server-driven programs, articles, routine recommendations, and challenges.
 * Admin can update content dynamically via LIFESTYLE_CONTENT_JSON without rebuilding clients.
 */
export const config = { runtime: 'edge' };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
};

const DEFAULT_LIFESTYLE_CONTENT = {
  version: 1,
  categories: [
    {
      id: 'nutrition',
      name: 'Nutrition & Fasting',
      subtitle: 'Circadian nutrition, local herbs & fasting balance',
      icon: 'Apple',
      gradient: ['#16a34a', '#15803d'],
      articlesCount: 18,
      programsCount: 4,
    },
    {
      id: 'fitness',
      name: 'Fitness & Gym',
      subtitle: 'Functional movement, HIIT & strength milestones',
      icon: 'Dumbbell',
      gradient: ['#0284c7', '#0369a1'],
      articlesCount: 14,
      programsCount: 6,
    },
    {
      id: 'sleep',
      name: 'Restorative Sleep',
      subtitle: 'Melatonin optimization & sleep architecture',
      icon: 'Moon',
      gradient: ['#6366f1', '#4f46e5'],
      articlesCount: 12,
      programsCount: 3,
    },
    {
      id: 'habits',
      name: 'Habits & Routines',
      subtitle: 'Atomic habit stacking & dopamine discipline',
      icon: 'Zap',
      gradient: ['#f59e0b', '#d97706'],
      articlesCount: 16,
      programsCount: 5,
    },
    {
      id: 'mental',
      name: 'Mental & Emotional Wellbeing',
      subtitle: 'Vagus nerve reset, 4-7-8 breathwork & resilience',
      icon: 'Brain',
      gradient: ['#ec4899', '#db2777'],
      articlesCount: 15,
      programsCount: 4,
    },
    {
      id: 'digital',
      name: 'Digital Wellbeing',
      subtitle: 'Screen curfew, notification detox & deep focus',
      icon: 'Smartphone',
      gradient: ['#8b5cf6', '#7c3aed'],
      articlesCount: 9,
      programsCount: 2,
    },
  ],
  featuredPrograms: [
    {
      id: 'prog-circadian-reset',
      title: '7-Day Circadian & Energy Reset',
      category: 'Sleep',
      level: 'Beginner',
      duration: '7 Days',
      lessonsCount: 7,
      downloadSize: '12 MB',
      description: 'Align your cortisol and melatonin cycles with morning sunlight and evening screen curfews.',
    },
    {
      id: 'prog-fasting-nutrition',
      title: 'Ethio-Mediterranean Anti-Inflammatory Plan',
      category: 'Nutrition',
      level: 'Intermediate',
      duration: '14 Days',
      lessonsCount: 14,
      downloadSize: '24 MB',
      description: 'Nutrient-dense, antioxidant-rich meal guides tailored to active fasting and vegan protein balance.',
    },
    {
      id: 'prog-mobility-hiit',
      title: 'At-Home Bodyweight Athletic Conditioning',
      category: 'Fitness',
      level: 'All Levels',
      duration: '21 Days',
      lessonsCount: 21,
      downloadSize: '45 MB',
      description: 'Zero-equipment progressive resistance, joint mobility, and high-intensity interval training.',
    },
  ],
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  try {
    let payload = DEFAULT_LIFESTYLE_CONTENT;
    if (process.env.LIFESTYLE_CONTENT_JSON) {
      try {
        payload = { ...DEFAULT_LIFESTYLE_CONTENT, ...JSON.parse(process.env.LIFESTYLE_CONTENT_JSON) };
      } catch (e) {
        console.warn('[Content API] Failed to parse LIFESTYLE_CONTENT_JSON env var');
      }
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=120',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * NuraCare Mobile Image Assets
 * Centralized source of curated photos, wellness banners, and botanical illustrations.
 * Bundled directly in native assets so they render instantly offline and online.
 */

export const LocalImages = {
  hero: require('../../assets/images/hero.png'),
  healthyLifestyle: require('../../assets/images/healthy_lifestyle.jpg'),
  beHealthy: require('../../assets/images/be_healthy.jpg'),
  naturalRemedies: require('../../assets/images/natural_remedies.jpg'),
  medication: require('../../assets/images/medication.jpg'),
  chamomile: require('../../assets/images/chamomile.jpg'),
  ginger: require('../../assets/images/ginger.jpg'),
  turmeric: require('../../assets/images/turmeric.jpg'),
  ashwagandha: require('../../assets/images/ashwagandha.jpg'),
};

/**
 * Returns a valid Image source object (local require or remote URI) with guaranteed fallback
 */
export function getSafeImageSource(uri?: string | null, fallbackKey: keyof typeof LocalImages = 'healthyLifestyle') {
  if (uri && uri.startsWith('local:')) {
    const key = uri.replace('local:', '') as keyof typeof LocalImages;
    if (LocalImages[key]) return LocalImages[key];
  }
  if (uri && (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('file://'))) {
    return { uri };
  }
  return LocalImages[fallbackKey] || LocalImages.healthyLifestyle;
}

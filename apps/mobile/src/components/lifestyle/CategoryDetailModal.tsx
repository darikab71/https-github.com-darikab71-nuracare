import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { X, Moon, Activity, Utensils, Wind, ShieldCheck, Zap, Droplets, Sparkles, Leaf, Flame } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface CategoryDetailModalProps {
  visible: boolean;
  category: 'recovery' | 'movement' | 'nourishment' | 'mindfulness' | 'gymNutrition' | null;
  onClose: () => void;
}

export default function CategoryDetailModal({
  visible,
  category,
  onClose,
}: CategoryDetailModalProps) {
  const { theme, isDark } = useTheme();

  if (!visible || !category) return null;

  const getDetails = () => {
    switch (category) {
      case 'gymNutrition':
        return {
          title: 'Gym & Athletic Nutrition Protocol',
          subtitle: 'Pre-workout fueling, protein synthesis & musculoskeletal repair',
          icon: Flame,
          color: '#ea580c',
          sections: [
            {
              heading: 'Pre-Workout Metabolic Fueling (45-60m prior)',
              body: 'Prioritize complex low-glycemic carbohydrates combined with clean natural vasodilators (e.g. sprouted teff porridge, banana with pinch of cinnamon, or beetroot). Avoid heavy fats immediately prior to lifting to prevent sluggish gastric emptying and digestive fatigue.',
            },
            {
              heading: 'Intra-Workout Mineral Homeostasis',
              body: 'Pure water paired with sodium, potassium, and magnesium prevents cellular dehydration and maintains neuromuscular conduction during heavy hypertrophy or high-volume compound lifts.',
            },
            {
              heading: 'Post-Workout Anabolic Window (within 45m)',
              body: 'Consume 25–35g of complete bioavailable protein paired with rapid-digesting carbs. This activates mTOR signaling for muscle protein synthesis and restores depleted intramuscular glycogen stores.',
            },
            {
              heading: 'Ethiopian Athletic Superfoods',
              body: 'Sprouted Teff flour delivers 13% plant protein and bioavailable iron; Roasted Chickpea (Kolo / Shimbra powder) offers rich branched-chain amino acids (BCAAs); Toasted Telba (flaxseed) infuses high anti-inflammatory Omega-3 for connective joint elasticity.',
            },
          ],
        };
      case 'recovery':
        return {
          title: 'Rest & Recovery Protocol',
          subtitle: 'Circadian synchronization & cellular restoration',
          icon: Moon,
          color: '#6366f1',
          sections: [
            {
              heading: 'Circadian Suprachiasmatic Anchor',
              body: 'Viewing 10-15 minutes of early morning sunlight within 60 minutes of waking anchors the master biological clock, suppresses daytime melatonin, and pre-programs robust evening sleep pressure.',
            },
            {
              heading: 'Digital Sunset (60 min prior)',
              body: 'Dim ambient blue-spectrum emissions 60 minutes before bed. Optical exposure to artificial blue light blocks Pineal gland melatonin secretion by up to 50%.',
            },
            {
              heading: 'Thermal Bedroom Regulation',
              body: 'Maintain ambient sleeping chamber between 18°C – 20°C (65°F - 68°F). Core body temperature must drop 1°C to initiate deep slow-wave stage 3/4 sleep.',
            },
          ],
        };
      case 'movement':
        return {
          title: 'Movement & Mobility Protocols',
          subtitle: 'Functional metabolic activity & posture health',
          icon: Activity,
          color: '#10b981',
          sections: [
            {
              heading: 'Eskista Scapular & Thoracic Reset',
              body: 'Traditional rhythmic shoulder pulses release trapezius tension, stimulate deep lymphatic drainage, and counteract cervical strain caused by seated desk posture.',
            },
            {
              heading: 'Postprandial Glucose Walk',
              body: 'A gentle 10 to 15-minute walk within 30 minutes following meals activates skeletal muscle GLUT4 transporters, blunting insulin spikes by up to 34%.',
            },
            {
              heading: 'Zone 2 Aerobic Foundation',
              body: 'Sustained conversational movement (e.g. brisk walking or light cycling) stimulates mitochondrial biogenesis, vascular health, and sustained daily stamina.',
            },
          ],
        };
      case 'nourishment':
        return {
          title: 'Integrative Nourishment & Fasting',
          subtitle: 'Microbiome diversity & cellular autophagy',
          icon: Utensils,
          color: '#16a34a',
          sections: [
            {
              heading: '100% Teff Injera (Prebiotic Grain)',
              body: 'Three-day naturally fermented teff is rich in low-glycemic iron, bioactive polyphenols, and resistant starch that selectively nourishes beneficial gut Bifidobacteria.',
            },
            {
              heading: 'Telba (Flaxseed) Omega Infusion',
              body: 'Toasted ground flaxseed steeped in warm water delivers concentrated Alpha-Linolenic Acid (ALA), soothing the digestive tract and supporting vascular elasticity.',
            },
            {
              heading: 'Moringa (Shiferaw) Vitality Greens',
              body: 'Micro-nutrient rich botanicals loaded with plant calcium, vitamin C, and quercetin to counter cellular oxidative stress and support metabolic resilience.',
            },
          ],
        };
      case 'mindfulness':
        return {
          title: 'Mindfulness & Autonomic Reset',
          subtitle: 'Vagal nerve stimulation & stress regulation',
          icon: Wind,
          color: '#f59e0b',
          sections: [
            {
              heading: '4-7-8 Parasympathetic Breathing',
              body: 'Inhaling for 4 seconds, holding for 7 seconds, and exhaling for 8 seconds stimulates the vagus nerve and shifts autonomic tone from sympathetic arousal to deep parasympathetic repair.',
            },
            {
              heading: '20-20-20 Ocular Micro-Pauses',
              body: 'Every 20 minutes, look at an object 20 feet away for 20 seconds to relax ciliary ocular spasms and reduce central nervous fatigue.',
            },
          ],
        };
    }
  };

  const details = getDetails();
  const Icon = details.icon;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surfaceModal, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: details.color + '20' }]}>
                <Icon size={18} color={details.color} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{details.title}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{details.subtitle}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {details.sections.map((sec, idx) => (
              <View
                key={idx}
                style={[styles.sectionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              >
                <View style={styles.sectionHeaderRow}>
                  <ShieldCheck size={16} color={details.color} />
                  <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>{sec.heading}</Text>
                </View>
                <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{sec.body}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Footer Action */}
          <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.accent }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Close Protocol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBody: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  doneBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { useAuth } from './AuthContext';
import { storage } from '../storage/mmkv';

import { useAuthStore } from '../store';

type ProfileContextType = {
  profile: any;
  loading: boolean;
  setProfile: (updates: any) => Promise<void>;
  clearProfile: () => void;
};

const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = user || storeUser;
  const [profile, setProfileState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProfileState(null);
      setLoading(false);
      return;
    }

    if (currentUser?.id && String(currentUser.id).startsWith('guest_')) {
      setProfileState({
        id: currentUser.id,
        name: currentUser.name || 'Guest Explorer',
        age: 28,
        culturalHeritage: 'Global',
        langPref: 'English',
        conditions: [],
        medications: [],
        fastingMode: currentUser.fastingMode || 'Orthodox Christian (Tsom)',
        medicalNotes: '',
        records: []
      });
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userId = currentUser.id;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data) {
          const fastingMode = storage.getString(`fastingMode_${userId}`) || 'None';
          const culturalHeritage = storage.getString(`culturalHeritage_${userId}`) || 'Global';
          const langPref = storage.getString(`langPref_${userId}`) || 'English';
          const gender = storage.getString(`gender_${userId}`) || data.gender || 'female';
          setProfileState({ ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref, gender });
        } else if (error && error.code === 'PGRST116') {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({ id: userId, name: currentUser.name || currentUser.user_metadata?.full_name || '', updated_at: new Date() })
            .select()
            .single();
          if (newProfile) {
            const fastingMode = storage.getString(`fastingMode_${userId}`) || 'None';
            const culturalHeritage = storage.getString(`culturalHeritage_${userId}`) || 'Global';
            const langPref = storage.getString(`langPref_${userId}`) || 'English';
            setProfileState({ ...newProfile, medicalNotes: newProfile.medical_notes, fastingMode, culturalHeritage, langPref });
          } else {
            setProfileState({ id: userId, name: currentUser.name || currentUser.user_metadata?.full_name || '', _fallback: true });
          }
        } else {
          setProfileState({ id: userId, name: currentUser.name || currentUser.user_metadata?.full_name || '', _fallback: true });
        }
      } catch (err) {
        console.warn("Profile fetch error, using local fallback", err);
        setProfileState({ id: currentUser.id, name: currentUser.name || 'Nura Explorer', _fallback: true });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [currentUser?.id]);

  const setProfile = async (updates: any) => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;
    
    const dbPayload = { ...updates };
    if ('medicalNotes' in dbPayload) {
      dbPayload.medical_notes = dbPayload.medicalNotes;
      delete dbPayload.medicalNotes;
    }
    
    if ('fastingMode' in dbPayload) {
      storage.set(`fastingMode_${userId}`, dbPayload.fastingMode);
      delete dbPayload.fastingMode;
    }

    if ('culturalHeritage' in dbPayload) {
      storage.set(`culturalHeritage_${userId}`, dbPayload.culturalHeritage);
      delete dbPayload.culturalHeritage;
    }

    if ('langPref' in dbPayload) {
      storage.set(`langPref_${userId}`, dbPayload.langPref);
      delete dbPayload.langPref;
    }

    if ('gender' in dbPayload) {
      storage.set(`gender_${userId}`, dbPayload.gender);
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...dbPayload, updated_at: new Date() })
        .select()
        .single();
        
      if (!error && data) {
        const fastingMode = storage.getString(`fastingMode_${userId}`) || 'None';
        const culturalHeritage = storage.getString(`culturalHeritage_${userId}`) || 'Global';
        const langPref = storage.getString(`langPref_${userId}`) || 'English';
        const gender = storage.getString(`gender_${userId}`) || data.gender || 'female';
        setProfileState({ ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref, gender });
      } else {
        setProfileState((prev: any) => ({ ...(prev || {}), ...updates }));
      }
    } catch (err) {
      setProfileState((prev: any) => ({ ...(prev || {}), ...updates }));
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    setLoading(false);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

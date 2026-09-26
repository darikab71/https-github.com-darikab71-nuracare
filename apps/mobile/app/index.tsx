import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user: authUser, loading } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = authUser || storeUser;

  if (loading) return null;

  // If user has an active session, open tabs; otherwise show Welcome & Login screen
  if (currentUser) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

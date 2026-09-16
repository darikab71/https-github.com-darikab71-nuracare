import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}

import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import '@/styles/global.css';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack />
    </>
  );
}

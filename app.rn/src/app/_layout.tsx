import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@react-navigation/native';
import { NAV_THEME } from '@/lib/theme';

import '@/styles/global.css';

export default function App() {
  return (
    <>
      <ThemeProvider value={NAV_THEME['dark']}>
        <StatusBar />
        <Stack />
        <PortalHost />
      </ThemeProvider>
    </>
  );
}

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DossiersProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DossiersProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            headerBackTitle: 'Retour',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'DAYNE · Dossiers' }} />
          <Stack.Screen name="dossier/[id]" options={{ title: 'Dossier' }} />
          <Stack.Screen name="dossier/edition" options={{ title: 'Dossier', presentation: 'modal' }} />
          <Stack.Screen name="sauvegarde" options={{ title: 'Sauvegarde', presentation: 'modal' }} />
        </Stack>
      </DossiersProvider>
    </SafeAreaProvider>
  );
}

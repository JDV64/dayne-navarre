import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { joursRestants, libelleEcheance } from '../lib/dates';
import { colors, space } from '../lib/theme';
import { Dossier } from '../lib/types';
import { Card, PhaseBadge, phaseProgress, ProgressBar } from './ui';

export function couleurEcheance(iso: string) {
  const n = joursRestants(iso);
  if (n === null) return colors.muted;
  if (n < 0) return colors.red;
  if (n <= 2) return colors.accent;
  return colors.green;
}

export function DossierCard({ d }: { d: Dossier }) {
  const faites = d.taches.filter((t) => t.faite).length;
  const cloture = d.phase === 'Clôturé';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/dossier/[id]', params: { id: d.id } })}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, marginBottom: space(3) })}
      accessibilityRole="button"
      accessibilityLabel={`Dossier ${d.client}`}
    >
      <Card style={cloture && { opacity: 0.7 }}>
        <View style={s.row}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={s.client} numberOfLines={1}>{d.client}</Text>
            <Text style={s.meta} numberOfLines={1}>
              {[d.reference, d.formule].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <PhaseBadge phase={d.phase} />
        </View>

        {!!d.prochaineAction && !cloture && (
          <View style={s.action}>
            <Text style={s.actionText} numberOfLines={2}>→ {d.prochaineAction}</Text>
            {!!d.echeance && (
              <Text style={[s.echeance, { color: couleurEcheance(d.echeance) }]}>
                {libelleEcheance(d.echeance)}
              </Text>
            )}
          </View>
        )}

        <View style={{ marginTop: space(3) }}>
          <ProgressBar value={phaseProgress(d.phase)} color={cloture ? colors.muted : colors.accent} />
          <View style={[s.row, { marginTop: 6 }]}>
            <Text style={s.small}>{d.adresse ? d.adresse.split(',').pop()?.trim() : ' '}</Text>
            {d.taches.length > 0 && <Text style={s.small}>Tâches {faites}/{d.taches.length}</Text>}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  client: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  action: { marginTop: space(3), backgroundColor: colors.bg, borderRadius: 10, padding: 10 },
  actionText: { fontSize: 14, color: colors.text },
  echeance: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  small: { fontSize: 12, color: colors.muted },
});

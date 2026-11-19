import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DossierCard } from '../components/DossierCard';
import { Button, Card, Chip, SectionTitle } from '../components/ui';
import { joursRestants } from '../lib/dates';
import { useDossiers } from '../lib/store';
import { colors, radius, space } from '../lib/theme';
import { Phase, PHASES } from '../lib/types';

type Filtre = 'Actifs' | 'Tous' | Phase;

function sansAccents(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function Accueil() {
  const { dossiers, pret, creerExemple } = useDossiers();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<Filtre>('Actifs');
  const insets = useSafeAreaInsets();

  const actifs = useMemo(() => dossiers.filter((d) => d.phase !== 'Clôturé'), [dossiers]);
  const enRetard = actifs.filter((d) => (joursRestants(d.echeance) ?? 1) < 0).length;
  const semaine = actifs.filter((d) => {
    const n = joursRestants(d.echeance);
    return n !== null && n >= 0 && n <= 7;
  }).length;

  const liste = useMemo(() => {
    const q = sansAccents(recherche.trim());
    return dossiers
      .filter((d) => (filtre === 'Tous' ? true : filtre === 'Actifs' ? d.phase !== 'Clôturé' : d.phase === filtre))
      .filter((d) =>
        !q
          ? true
          : sansAccents([d.client, d.reference, d.adresse, d.formule, d.prochaineAction].join(' ')).includes(q),
      )
      .sort((a, b) => {
        // Échéances les plus proches d'abord, puis les dossiers sans échéance (plus récents d'abord)
        const ea = a.echeance && a.phase !== 'Clôturé' ? a.echeance : '9999';
        const eb = b.echeance && b.phase !== 'Clôturé' ? b.echeance : '9999';
        return ea === eb ? b.updatedAt.localeCompare(a.updatedAt) : ea.localeCompare(eb);
      });
  }, [dossiers, recherche, filtre]);

  if (!pret) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const entete = (
    <View>
      <View style={s.kpis}>
        <Kpi valeur={actifs.length} libelle="Dossiers actifs" />
        <Kpi valeur={semaine} libelle="Échéances 7 j" couleur={colors.accent} />
        <Kpi valeur={enRetard} libelle="En retard" couleur={enRetard ? colors.red : colors.green} />
      </View>

      <TextInput
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher un client, une adresse, une référence…"
        placeholderTextColor="#A8A59C"
        style={s.search}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space(3) }}>
        {(['Actifs', 'Tous', ...PHASES] as Filtre[]).map((f) => (
          <Chip key={f} label={f} active={filtre === f} onPress={() => setFiltre(f)} />
        ))}
      </ScrollView>

      <SectionTitle>
        {liste.length} dossier{liste.length > 1 ? 's' : ''}
      </SectionTitle>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/sauvegarde')} hitSlop={12} accessibilityRole="button">
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600', paddingHorizontal: 4 }}>Sauvegarde</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={liste}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => <DossierCard d={item} />}
        ListHeaderComponent={entete}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space(4), paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={
          <Card style={{ alignItems: 'center', paddingVertical: space(8) }}>
            <Text style={s.emptyTitle}>
              {dossiers.length ? 'Aucun dossier ne correspond' : 'Aucun dossier pour le moment'}
            </Text>
            <Text style={s.emptyText}>
              {dossiers.length
                ? 'Essayez un autre filtre ou une autre recherche.'
                : 'Créez votre premier dossier client, ou chargez un exemple pour découvrir l’appli.'}
            </Text>
            {!dossiers.length && (
              <Button
                label="Charger un exemple"
                variant="secondary"
                small
                style={{ marginTop: space(4) }}
                onPress={() => {
                  const id = creerExemple();
                  router.push({ pathname: '/dossier/[id]', params: { id } });
                }}
              />
            )}
          </Card>
        }
      />
      <View style={[s.fabWrap, { bottom: insets.bottom + space(4) }]}>
        <Button label="+ Nouveau dossier" onPress={() => router.push('/dossier/edition')} style={s.fab} />
      </View>
    </View>
  );
}

function Kpi({ valeur, libelle, couleur = colors.text }: { valeur: number; libelle: string; couleur?: string }) {
  return (
    <Card style={s.kpi}>
      <Text style={[s.kpiVal, { color: couleur }]}>{valeur}</Text>
      <Text style={s.kpiLib}>{libelle}</Text>
    </Card>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kpis: { flexDirection: 'row', gap: space(2) },
  kpi: { flex: 1, paddingVertical: space(3), paddingHorizontal: space(3) },
  kpiVal: { fontSize: 28, fontWeight: '700' },
  kpiLib: { fontSize: 12, color: colors.muted, marginTop: 2 },
  search: {
    marginTop: space(4),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 6, maxWidth: 300 },
  fabWrap: { position: 'absolute', left: space(4), right: space(4) },
  fab: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});

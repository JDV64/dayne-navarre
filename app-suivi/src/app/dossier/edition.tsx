import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Button, Chip, Field, styles as ui } from '../../components/ui';
import { dansJours, formatFR, parseFR } from '../../lib/dates';
import { useDossiers } from '../../lib/store';
import { colors, space } from '../../lib/theme';
import { DossierInput, FORMULES, PHASES } from '../../lib/types';

const VIDE: DossierInput = {
  reference: '',
  client: '',
  telephone: '',
  email: '',
  adresse: '',
  formule: 'SÉCURISER',
  phase: 'Prospect',
  prochaineAction: '',
  echeance: '',
  honorairesHT: '',
  budgetTravaux: '',
};

export default function Edition() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { get, creer, modifier, dossiers } = useDossiers();
  const existant = id ? get(id) : undefined;

  const [f, setF] = useState<DossierInput>(() => {
    if (existant) {
      const { id: _i, taches: _t, journal: _j, createdAt: _c, updatedAt: _u, ...reste } = existant;
      return reste;
    }
    const annee = new Date().getFullYear();
    const n = dossiers.filter((d) => d.reference.startsWith(`DAY-${annee}`)).length + 1;
    return { ...VIDE, reference: `DAY-${annee}-${String(n).padStart(3, '0')}` };
  });
  const [dateSaisie, setDateSaisie] = useState(formatFR(f.echeance));
  const [erreurs, setErreurs] = useState<{ client?: string; date?: string }>({});

  const set = <K extends keyof DossierInput>(k: K, v: DossierInput[K]) => setF((x) => ({ ...x, [k]: v }));

  const enregistrer = () => {
    const iso = parseFR(dateSaisie);
    const e: typeof erreurs = {};
    if (!f.client.trim()) e.client = 'Indiquez le nom du client.';
    if (iso === null) e.date = 'Format attendu : JJ/MM/AAAA';
    setErreurs(e);
    if (Object.keys(e).length) return;
    const data = { ...f, client: f.client.trim(), echeance: iso ?? '' };
    if (existant) {
      modifier(existant.id, data);
      router.back();
    } else {
      const nid = creer(data);
      router.replace({ pathname: '/dossier/[id]', params: { id: nid } });
    }
  };

  const raccourci = (j: number) => {
    const iso = dansJours(j);
    setDateSaisie(formatFR(iso));
    setErreurs((x) => ({ ...x, date: undefined }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: existant ? 'Modifier le dossier' : 'Nouveau dossier' }} />
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(16) }} keyboardShouldPersistTaps="handled">
        <Text style={[ui.section, { marginBottom: space(3) }]}>Client</Text>
        <Field
          label="Nom du client *"
          value={f.client}
          onChangeText={(v) => set('client', v)}
          placeholder="Ex. M. et Mme Dupont"
          error={erreurs.client}
          autoFocus={!existant}
        />
        <Field label="Référence" value={f.reference} onChangeText={(v) => set('reference', v)} autoCapitalize="characters" />
        <Field
          label="Téléphone"
          value={f.telephone}
          onChangeText={(v) => set('telephone', v)}
          keyboardType="phone-pad"
          placeholder="06 …"
        />
        <Field
          label="E-mail"
          value={f.email}
          onChangeText={(v) => set('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Field
          label="Adresse du projet"
          value={f.adresse}
          onChangeText={(v) => set('adresse', v)}
          placeholder="Rue, code postal, commune"
        />

        <Text style={[ui.section, { marginTop: space(4), marginBottom: space(3) }]}>Mission</Text>
        <Text style={ui.label}>Formule</Text>
        <Wrap>
          {FORMULES.map((x) => (
            <Chip key={x} label={x} active={f.formule === x} onPress={() => set('formule', x)} />
          ))}
        </Wrap>
        <Text style={ui.label}>Phase</Text>
        <Wrap>
          {PHASES.map((x) => (
            <Chip key={x} label={x} active={f.phase === x} onPress={() => set('phase', x)} />
          ))}
        </Wrap>
        <Field
          label="Honoraires HT (€)"
          value={f.honorairesHT}
          onChangeText={(v) => set('honorairesHT', v)}
          keyboardType="numeric"
        />
        <Field
          label="Budget travaux (€)"
          value={f.budgetTravaux}
          onChangeText={(v) => set('budgetTravaux', v)}
          keyboardType="numeric"
        />

        <Text style={[ui.section, { marginTop: space(4), marginBottom: space(3) }]}>Prochaine action</Text>
        <Field
          label="Quoi ?"
          value={f.prochaineAction}
          onChangeText={(v) => set('prochaineAction', v)}
          placeholder="Ex. Relancer l’entreprise de gros œuvre"
          multiline
        />
        <Field
          label="Échéance"
          value={dateSaisie}
          onChangeText={(v) => {
            setDateSaisie(v);
            setErreurs((x) => ({ ...x, date: undefined }));
          }}
          placeholder="JJ/MM/AAAA"
          keyboardType="numbers-and-punctuation"
          error={erreurs.date}
          hint="Laissez vide s’il n’y a pas d’échéance."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginTop: -space(2), marginBottom: space(4) }}>
          <Button small variant="secondary" label="Aujourd’hui" onPress={() => raccourci(0)} />
          <Button small variant="secondary" label="Demain" onPress={() => raccourci(1)} />
          <Button small variant="secondary" label="+1 sem." onPress={() => raccourci(7)} />
          <Button small variant="secondary" label="+1 mois" onPress={() => raccourci(30)} />
          <Button small variant="ghost" label="Effacer" onPress={() => setDateSaisie('')} />
        </View>

        <Button label={existant ? 'Enregistrer' : 'Créer le dossier'} onPress={enregistrer} />
        <Button label="Annuler" variant="ghost" onPress={() => router.back()} style={{ marginTop: space(2) }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Wrap({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: space(2), marginBottom: space(4) }}>{children}</View>
  );
}

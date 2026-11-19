import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { couleurEcheance } from '../../components/DossierCard';
import { Button, Card, PhaseBadge, SectionTitle, styles as ui } from '../../components/ui';
import { formatFR, formatHorodatage, libelleEcheance } from '../../lib/dates';
import { useDossiers } from '../../lib/store';
import { colors, radius, space } from '../../lib/theme';
import { Dossier, PHASES } from '../../lib/types';

function confirmer(titre: string, message: string, ok: () => void) {
  if (Platform.OS === 'web') {
    // Alert multi-boutons non supporté sur le web
    if (globalThis.confirm?.(`${titre}\n\n${message}`)) ok();
    return;
  }
  Alert.alert(titre, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: ok },
  ]);
}

function resume(d: Dossier) {
  const l = [
    `${d.client}${d.reference ? ` (${d.reference})` : ''}`,
    `Formule : ${d.formule} · Phase : ${d.phase}`,
    d.adresse && `Adresse : ${d.adresse}`,
    d.prochaineAction && `Prochaine action : ${d.prochaineAction}${d.echeance ? ` (le ${formatFR(d.echeance)})` : ''}`,
    d.taches.length && `\nTâches :\n${d.taches.map((t) => `${t.faite ? '☑' : '☐'} ${t.texte}`).join('\n')}`,
    d.journal.length && `\nDernières notes :\n${d.journal.slice(0, 5).map((n) => `• ${formatHorodatage(n.date)} – ${n.texte}`).join('\n')}`,
  ];
  return l.filter(Boolean).join('\n');
}

export default function DetailDossier() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useDossiers();
  const d = store.get(id);
  const [nouvelleTache, setNouvelleTache] = useState('');
  const [nouvelleNote, setNouvelleNote] = useState('');

  if (!d) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space(6) }}>
        <Stack.Screen options={{ title: 'Dossier' }} />
        <Text style={{ color: colors.muted, marginBottom: space(4) }}>Ce dossier n’existe plus.</Text>
        <Button label="Retour à la liste" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const idxPhase = PHASES.indexOf(d.phase);
  const faites = d.taches.filter((t) => t.faite).length;

  const ouvrir = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Impossible d’ouvrir ce lien sur cet appareil.'));

  const plan = () => {
    const q = encodeURIComponent(d.adresse);
    ouvrir(Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`);
  };

  const ajouterTache = () => {
    const t = nouvelleTache.trim();
    if (!t) return;
    store.ajouterTache(d.id, t);
    setNouvelleTache('');
  };

  const ajouterNote = () => {
    const t = nouvelleNote.trim();
    if (!t) return;
    store.ajouterNote(d.id, t);
    setNouvelleNote('');
  };

  const changerPhase = (i: number) => {
    const p = PHASES[i];
    if (!p || p === d.phase) return;
    store.modifier(d.id, { phase: p });
    store.ajouterNote(d.id, `Phase : ${d.phase} → ${p}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen
        options={{
          title: d.reference || 'Dossier',
          headerRight: () => (
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/dossier/edition', params: { id: d.id } })}
            >
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600', paddingHorizontal: 4 }}>Modifier</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(16) }} keyboardShouldPersistTaps="handled">
        {/* En-tête */}
        <Text style={s.client}>{d.client}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <PhaseBadge phase={d.phase} />
          <Text style={s.formule}>{d.formule}</Text>
        </View>

        {/* Contact */}
        {(d.telephone || d.email || d.adresse) && (
          <View style={s.contacts}>
            {!!d.telephone && (
              <Button small variant="secondary" label="Appeler" onPress={() => ouvrir(`tel:${d.telephone.replace(/\s/g, '')}`)} style={s.contactBtn} />
            )}
            {!!d.telephone && (
              <Button small variant="secondary" label="SMS" onPress={() => ouvrir(`sms:${d.telephone.replace(/\s/g, '')}`)} style={s.contactBtn} />
            )}
            {!!d.email && (
              <Button small variant="secondary" label="E-mail" onPress={() => ouvrir(`mailto:${d.email}`)} style={s.contactBtn} />
            )}
            {!!d.adresse && <Button small variant="secondary" label="Itinéraire" onPress={plan} style={s.contactBtn} />}
          </View>
        )}

        {/* Prochaine action */}
        <SectionTitle>Prochaine action</SectionTitle>
        <Card>
          {d.prochaineAction ? (
            <>
              <Text style={s.action}>{d.prochaineAction}</Text>
              <Text style={[s.echeance, { color: couleurEcheance(d.echeance) }]}>
                {libelleEcheance(d.echeance)}
                {d.echeance ? ` · ${formatFR(d.echeance)}` : ''}
              </Text>
            </>
          ) : (
            <Text style={s.vide}>Aucune action prévue.</Text>
          )}
          <View style={{ flexDirection: 'row', gap: space(2), marginTop: space(3) }}>
            <Button
              small
              variant="secondary"
              label="Planifier"
              onPress={() => router.push({ pathname: '/dossier/edition', params: { id: d.id } })}
            />
            {!!d.prochaineAction && (
              <Button
                small
                variant="ghost"
                label="✓ Marquer faite"
                onPress={() => {
                  store.ajouterNote(d.id, `Fait : ${d.prochaineAction}`);
                  store.modifier(d.id, { prochaineAction: '', echeance: '' });
                }}
              />
            )}
          </View>
        </Card>

        {/* Phases */}
        <SectionTitle>Avancement</SectionTitle>
        <Card style={{ paddingVertical: space(2) }}>
          {PHASES.map((p, i) => {
            const passe = i < idxPhase;
            const courant = i === idxPhase;
            return (
              <Pressable
                key={p}
                onPress={() => changerPhase(i)}
                style={s.etape}
                accessibilityRole="button"
                accessibilityState={{ selected: courant }}
                accessibilityLabel={`Passer en phase ${p}`}
              >
                <View
                  style={[
                    s.pastille,
                    passe && { backgroundColor: colors.green, borderColor: colors.green },
                    courant && { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                >
                  {(passe || courant) && <Text style={s.pastilleTxt}>{passe ? '✓' : i + 1}</Text>}
                </View>
                <Text style={[s.etapeTxt, courant && { fontWeight: '700', color: colors.text }, passe && { color: colors.text }]}>
                  {p}
                </Text>
              </Pressable>
            );
          })}
          <Text style={[ui.hint, { marginTop: 4, marginBottom: 6 }]}>Touchez une étape pour changer la phase.</Text>
        </Card>

        {/* Chiffres */}
        {(!!d.honorairesHT || !!d.budgetTravaux) && (
          <View style={{ flexDirection: 'row', gap: space(2), marginTop: space(4) }}>
            {!!d.honorairesHT && <Montant libelle="Honoraires HT" valeur={d.honorairesHT} />}
            {!!d.budgetTravaux && <Montant libelle="Budget travaux" valeur={d.budgetTravaux} />}
          </View>
        )}

        {/* Tâches */}
        <SectionTitle right={d.taches.length ? <Text style={ui.hint}>{faites}/{d.taches.length}</Text> : undefined}>
          Tâches
        </SectionTitle>
        <Card style={{ paddingVertical: space(2) }}>
          {d.taches.map((t) => (
            <View key={t.id} style={s.tache}>
              <Pressable
                onPress={() => store.basculerTache(d.id, t.id)}
                style={s.tacheMain}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: t.faite }}
              >
                <View style={[s.case, t.faite && { backgroundColor: colors.green, borderColor: colors.green }]}>
                  {t.faite && <Text style={s.pastilleTxt}>✓</Text>}
                </View>
                <Text style={[s.tacheTxt, t.faite && { textDecorationLine: 'line-through', color: colors.muted }]}>
                  {t.texte}
                </Text>
              </Pressable>
              <Pressable
                hitSlop={10}
                onPress={() => store.supprimerTache(d.id, t.id)}
                accessibilityRole="button"
                accessibilityLabel={`Supprimer la tâche ${t.texte}`}
              >
                <Text style={s.croix}>×</Text>
              </Pressable>
            </View>
          ))}
          <View style={s.ajout}>
            <TextInput
              value={nouvelleTache}
              onChangeText={setNouvelleTache}
              placeholder="Ajouter une tâche…"
              placeholderTextColor="#A8A59C"
              style={s.ajoutInput}
              onSubmitEditing={ajouterTache}
              returnKeyType="done"
              submitBehavior="submit"
            />
            <Button small label="Ajouter" onPress={ajouterTache} disabled={!nouvelleTache.trim()} />
          </View>
        </Card>

        {/* Journal */}
        <SectionTitle>Journal</SectionTitle>
        <Card>
          <TextInput
            value={nouvelleNote}
            onChangeText={setNouvelleNote}
            placeholder="Compte rendu d’appel, visite, décision…"
            placeholderTextColor="#A8A59C"
            style={[ui.input, { minHeight: 70, textAlignVertical: 'top' }]}
            multiline
          />
          <Button small label="Ajouter la note" onPress={ajouterNote} disabled={!nouvelleNote.trim()} style={{ marginTop: space(2), alignSelf: 'flex-start' }} />
          {d.journal.map((n) => (
            <Pressable
              key={n.id}
              onLongPress={() => confirmer('Supprimer cette note ?', n.texte, () => store.supprimerNote(d.id, n.id))}
              style={s.note}
            >
              <Text style={s.noteDate}>{formatHorodatage(n.date)}</Text>
              <Text style={s.noteTxt}>{n.texte}</Text>
            </Pressable>
          ))}
          {d.journal.length > 0 && <Text style={[ui.hint, { marginTop: space(2) }]}>Appui long sur une note pour la supprimer.</Text>}
        </Card>

        {/* Actions dossier */}
        <View style={{ gap: space(2), marginTop: space(8) }}>
          <Button label="Partager un résumé" variant="secondary" onPress={() => Share.share({ message: resume(d), title: d.client })} />
          <Button
            label="Supprimer le dossier"
            variant="danger"
            onPress={() =>
              confirmer('Supprimer ce dossier ?', `${d.client} sera définitivement supprimé de cet appareil.`, () => {
                router.back();
                store.supprimer(d.id);
              })
            }
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Montant({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <Card style={{ flex: 1 }}>
      <Text style={ui.hint}>{libelle}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 4 }}>{valeur} €</Text>
    </Card>
  );
}

const s = StyleSheet.create({
  client: { fontSize: 26, fontWeight: '700', color: colors.text },
  formule: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  contacts: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginTop: space(4) },
  contactBtn: { flexGrow: 1 },
  action: { fontSize: 16, color: colors.text, lineHeight: 22 },
  echeance: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  vide: { fontSize: 15, color: colors.muted },
  etape: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, minHeight: 44 },
  pastille: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pastilleTxt: { color: colors.white, fontSize: 12, fontWeight: '700' },
  etapeTxt: { fontSize: 15, color: colors.muted },
  tache: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  tacheMain: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  case: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tacheTxt: { flex: 1, fontSize: 15, color: colors.text },
  croix: { fontSize: 22, color: colors.muted, paddingHorizontal: 6 },
  ajout: { flexDirection: 'row', alignItems: 'center', gap: space(2), marginTop: space(2), marginBottom: space(2) },
  ajoutInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
  },
  note: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space(3), marginTop: space(3) },
  noteDate: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  noteTxt: { fontSize: 15, color: colors.text, marginTop: 2, lineHeight: 21 },
});

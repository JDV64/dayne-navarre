import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Share, Text } from 'react-native';

import { Button, Card, Field, SectionTitle, styles as ui } from '../components/ui';
import { useDossiers } from '../lib/store';
import { colors, space } from '../lib/theme';

export default function Sauvegarde() {
  const { exporter, importer, dossiers } = useDossiers();
  const [texte, setTexte] = useState('');
  const [erreur, setErreur] = useState('');

  const importerTexte = () => {
    try {
      const n = importer(texte);
      setTexte('');
      Alert.alert('Import terminé', `${n} dossier${n > 1 ? 's' : ''} importé${n > 1 ? 's' : ''}.`);
      router.back();
    } catch {
      setErreur('Ce texte n’est pas une sauvegarde DAYNE Suivi valide.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(16) }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 15, color: colors.muted, lineHeight: 21 }}>
        Vos dossiers sont enregistrés uniquement sur ce téléphone. Exportez-les régulièrement (mail, WhatsApp, Notes,
        SharePoint…) pour les conserver ou les transférer sur un autre appareil.
      </Text>

      <SectionTitle>Exporter</SectionTitle>
      <Card>
        <Text style={ui.label}>{dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} sur cet appareil</Text>
        <Button
          label="Partager la sauvegarde"
          onPress={() => Share.share({ message: exporter(), title: 'Sauvegarde DAYNE Suivi' })}
          disabled={!dossiers.length}
          style={{ marginTop: space(2) }}
        />
      </Card>

      <SectionTitle>Importer</SectionTitle>
      <Card>
        <Field
          label="Collez ici le texte de la sauvegarde"
          value={texte}
          onChangeText={(v) => {
            setTexte(v);
            setErreur('');
          }}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          error={erreur}
          hint="Les dossiers déjà présents avec le même identifiant sont mis à jour, les autres sont ajoutés."
          style={{ minHeight: 140, fontSize: 13 }}
        />
        <Button label="Importer" variant="secondary" onPress={importerTexte} disabled={!texte.trim()} />
      </Card>
    </ScrollView>
  );
}

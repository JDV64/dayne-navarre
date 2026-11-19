# DAYNE Suivi – application mobile de suivi des dossiers

Application Expo (iPhone + Android) pour suivre les dossiers clients DAYNE.

## Fonctionnalités

- **Tableau de bord** : dossiers actifs, échéances à 7 jours, actions en retard.
- **Liste des dossiers** triée par échéance, recherche (client, adresse, référence…) et filtre par phase.
- **Fiche dossier** :
  - contact en un geste : appeler, SMS, e-mail, itinéraire ;
  - prochaine action + échéance (« Marquer faite » l'archive dans le journal) ;
  - avancement par phase : Prospect → Diagnostic → Conception → Consultation → Chantier → Réception → Levée des réserves → Clôturé ;
  - formule : SÉCURISER, CONCEVOIR, Accompagnement Membre / Premium / Signature, MOE, Clé en main ;
  - honoraires HT et budget travaux ;
  - liste de tâches à cocher ;
  - journal horodaté (comptes rendus, décisions, changements de phase) ;
  - partage d'un résumé texte (WhatsApp, mail…).
- **Sauvegarde** : export / import de tous les dossiers (texte JSON partageable).

Les données sont stockées **uniquement sur le téléphone** (AsyncStorage). Pensez à exporter régulièrement.

## Lancer l'appli sur votre téléphone (Expo Go)

```bash
cd app-suivi
npm install
npx expo start
```

Scannez le QR code avec l'appareil photo (iPhone) ou l'appli **Expo Go** (Android).

## Installer l'appli « pour de vrai » (EAS Build)

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # APK à installer directement
npx eas-cli@latest build --profile production --platform ios    # puis : eas submit -p ios (TestFlight)
```

Identifiant d'application : `fr.dayne.suivi`.

## Structure

```
src/app/            écrans (Expo Router)
  index.tsx           tableau de bord + liste
  dossier/[id].tsx    fiche dossier
  dossier/edition.tsx création / modification
  sauvegarde.tsx      export / import
src/lib/            données (store, types, dates, thème)
src/components/     composants d'interface
```

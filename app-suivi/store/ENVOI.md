# Envoyer DAYNE Suivi sur l'App Store

## Prérequis (une seule fois)

1. **Compte Apple Developer** (99 €/an) : https://developer.apple.com/programs/
   Inscription en tant qu'organisation DAYNE (numéro D-U-N-S demandé, gratuit) ou à titre individuel.
2. **Compte Expo** gratuit : https://expo.dev/signup
3. Dans App Store Connect, créer l'app avec les informations de `FICHE-APP-STORE.md`.

## Compiler et envoyer (depuis un ordinateur, sans Xcode)

```bash
cd app-suivi
npm install
npx eas-cli@latest login                 # compte Expo
npx eas-cli@latest init                  # relie le projet à Expo (une seule fois)
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

EAS demande l'identifiant Apple, crée le certificat et le profil de distribution, compile l'app
dans le cloud (~15 min) puis l'envoie à App Store Connect.

## Ensuite, dans App Store Connect

- **TestFlight** : la version apparaît après ~10 min de traitement. Ajoutez-vous comme testeur interne
  pour l'installer sur votre iPhone avec l'app TestFlight (pas de vérification Apple).
- **App Store** : onglet « Distribution », renseignez la fiche, les captures (`captures-iphone-6.9/`),
  choisissez la version, puis « Soumettre pour vérification » (24–48 h en général).

## Mises à jour

Changer `version` dans `app.json` (ex. 1.0.1), puis relancer la commande `build … --auto-submit`.
Le numéro de build s'incrémente automatiquement.

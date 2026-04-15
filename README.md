# Prospéctor - Guide de Build Android (.apk)

Cette application est conçue pour être utilisée comme une application mobile native sur Android grâce à **Capacitor**.

## 🚀 Comment obtenir le fichier .apk

Comme l'environnement de développement en ligne ne dispose pas du SDK Android complet, vous devez générer le fichier APK sur votre machine locale ou via un service de build.

### Option 1 : Build Local (Recommandé)

1. **Prérequis :**
   - Node.js installé.
   - Android Studio installé avec le SDK Android.
   - Java (JDK 17+) installé.

2. **Étapes :**
   - Clonez le projet ou téléchargez le code source.
   - Ouvrez un terminal dans le dossier du projet.
   - Installez les dépendances :
     ```bash
     npm install
     ```
   - Construisez l'application web :
     ```bash
     npm run build
     ```
   - Synchronisez avec le projet Android :
     ```bash
     npm run cap:sync
     ```
   - Générez l'APK :
     ```bash
     npm run cap:build
     ```
   - Le fichier APK sera généré dans : `android/app/build/outputs/apk/debug/app-debug.apk`.

### Option 2 : Utiliser Android Studio

Si vous préférez l'interface graphique :
1. Suivez les étapes ci-dessus jusqu'à `cap:sync`.
2. Ouvrez le projet dans Android Studio :
   ```bash
   npm run cap:open
   ```
3. Dans Android Studio, allez dans **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 📱 Installation sur Smartphone

1. Transférez le fichier `.apk` sur votre téléphone (via USB, Google Drive, ou WhatsApp).
2. Sur votre téléphone, ouvrez le fichier.
3. Si demandé, autorisez l'installation depuis des "sources inconnues".
4. L'application **Prospéctor** sera installée et prête à l'emploi !

## 🛠️ Configuration Technique (Déjà faite)

L'application est déjà configurée avec :
- **Capacitor Core & CLI**
- **Plateforme Android**
- **Permissions Géolocalisation** (configurées dans `android/app/src/main/AndroidManifest.xml`)

## 🌐 Alternative : PWA (Sans APK)

Vous pouvez aussi simplement ouvrir l'URL de l'application dans Chrome sur Android, puis cliquer sur les trois points en haut à droite et choisir **"Installer l'application"**. Cela créera une icône sur votre écran d'accueil sans avoir besoin de fichier APK.

# KAPA-App Deployment Anleitung

## Option 1: Netlify (Empfohlen)

### Manuelles Deployment via Netlify Web Interface

1. Gehen Sie zu [https://app.netlify.com/](https://app.netlify.com/)
2. Melden Sie sich an oder erstellen Sie einen Account
3. Klicken Sie auf "Add new site" → "Deploy manually"
4. Ziehen Sie den gesamten Ordner `kapa-app-prototype` in das Upload-Feld
5. Netlify deployed die App automatisch

**Wichtig:** 
- Build Command: (leer lassen)
- Publish Directory: `.` (Root-Verzeichnis)
- Die App ist eine statische HTML/JS App und benötigt keinen Build-Prozess

### Via Netlify CLI (falls installiert)

```bash
# Netlify CLI installieren (falls noch nicht vorhanden)
npm install -g netlify-cli

# In das Projektverzeichnis wechseln
cd "c:/Users/Pinru/OneDrive - CNT Management Consulting AG/Desktop/KAPA-App Protokoll/kapa-app-prototype"

# Deployment
netlify deploy --prod --dir .
```

## Option 2: GitHub Pages

1. Repository auf GitHub erstellen
2. Code hochladen
3. In Repository Settings → Pages
4. Source: "Deploy from a branch"
5. Branch: main, Folder: / (root)

## Option 3: Vercel

1. Gehen Sie zu [https://vercel.com/](https://vercel.com/)
2. "Add New Project"
3. Import Git Repository oder Upload Folder
4. Framework Preset: "Other"
5. Build Command: (leer lassen)
6. Output Directory: `.`
7. Deploy

## Technische Details

- **Framework**: Statische HTML/JS App mit SAPUI5
- **Build erforderlich**: Nein
- **Abhängigkeiten**: Keine (SAPUI5 wird via CDN geladen)
- **Dateien**:
  - `index.html` (Entry Point)
  - `css/custom.css`
  - `js/*.js` (App-Logik)
  - `data/*.json` (Beispieldaten)

## Nach dem Deployment

Die App läuft komplett im Browser:
- Daten werden in LocalStorage gespeichert
- Keine Backend-Verbindung erforderlich
- SAPUI5 wird von `https://openui5.hana.ondemand.com/` geladen

## Empfohlene URL-Namen

- `kapa-app-capacity-planning`
- `kapa-capacity-planner`
- `cnt-kapa-app`

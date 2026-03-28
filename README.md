# KAPA-App Prototyp

Funktionaler Frontend-Prototyp der KAPA-App mit SAPUI5/Fiori-Design.

## 🎯 Features

✅ **KPI Dashboard**
- Utilization Metrics (2M, YTD, 12M) aus HR-System
- KAPA-Call Aggregationen (by Area, Region, Skills)
- Drill-Down Funktionalität

✅ **Team Viewer - Capacity Planning**
- Flexible Wochenansicht (3, 6 oder 9 Wochen)
- Ampelsystem: Vergleich Plandaten vs. historische Utilization
- Farbcodierung: 🟦 Fest | 🟨 Option | 🔴 Überbucht
- Mitarbeiter-Status: 🟢 Optimal | 🟡 Abweichung | 🔴 Kritisch

✅ **KAPA-Call Detail Tabelle**
- Monatliche freie Kapazitäten
- Editierbare Skills mit standardisiertem Dropdown
- **Inline Skill-Management: '+' Button zum Hinzufügen neuer Skills**
- Filter nach freien Kapazitäten

✅ **Skill-Management**
- Neue Skills direkt in der App erstellen
- Kategorisierung (SAP Module, Technologien, Lösungen, Cloud, etc.)
- Custom Skills verwalten und löschen
- Automatische Aktualisierung aller Dropdowns

✅ **Konfigurierbare Ampel-Schwellwerte**
- Einstellungen-Dialog für individuelle Anpassung
- Grün/Gelb/Rot Schwellwerte konfigurierbar

✅ **LocalStorage Persistenz**
- Alle Daten werden lokal gespeichert
- Änderungen bleiben nach Browser-Reload erhalten

## 📦 Technologie-Stack

- **SAPUI5:** Version 1.120 (CDN)
- **Framework:** sap.m, sap.ui.table, sap.f
- **Theme:** SAP Horizon
- **Storage:** Browser LocalStorage
- **Mock-Daten:** JSON-Dateien

## 🚀 Setup & Start

### Variante 1: Direkt im Browser öffnen

1. Projekt herunterladen/entpacken
2. `index.html` im Browser öffnen (Chrome oder Edge empfohlen)
3. Fertig! Die App lädt automatisch die Mock-Daten

### Variante 2: Mit lokalem Webserver (empfohlen)

```bash
# Im Projekt-Verzeichnis
npx http-server -p 8080

# Oder mit Python
python -m http.server 8080

# Oder mit Node.js
npm install -g http-server
http-server -p 8080
```

Dann öffnen: **http://localhost:8080**

## 📖 Bedienung

### Skill-Management

#### Neuen Skill hinzufügen:
1. In der **KAPA-Call Detail Tabelle** auf den **'+'** Button neben dem Skill-Dropdown klicken
2. Skill-Name eingeben (z.B. "Kubernetes", "SAP IBP")
3. Kategorie auswählen:
   - **SAP Module:** SD, MM, PP, PM, FI/CO, HR, QM, WM
   - **Technologien:** SAP S/4HANA, BTP, Fiori, ABAP, SAPUI5, Analytics Cloud
   - **Lösungen:** Ariba, SuccessFactors, Concur, Fieldglass, IBP, APO
   - **Cloud:** Public Cloud, Private Cloud, Hybrid Cloud
   - **Soft Skills:** Project Management, Change Management, Training, Consulting
   - **Programmiersprachen:** Python, Java, JavaScript, ABAP, SQL
   - **Sonstige:** Für alle anderen Skills
4. "Hinzufügen" klicken
5. Der neue Skill ist sofort in allen Dropdowns verfügbar

#### Skills verwalten:
1. In der KAPA-Call Toolbar auf **"Skills verwalten"** klicken
2. Übersicht aller benutzerdefinierten Skills
3. Custom Skills können gelöscht werden (Standard-Skills nicht)
4. Neuen Skill direkt aus dem Dialog hinzufügen

### Ampel-Schwellwerte anpassen:
1. Auf das **Einstellungen-Icon** (⚙️) in der Header-Leiste klicken
2. Schwellwerte mit Slidern anpassen:
   - **Grün:** Abweichung bis ±X% → Optimal
   - **Gelb:** Abweichung bis ±X% → Abweichung
   - **Rot:** Abweichung über Gelb-Schwellwert → Kritisch
3. "Speichern" → Ampeln werden neu berechnet

### Wochenansicht wechseln:
- Im Team Viewer zwischen **3, 6 oder 9 Wochen** umschalten
- Ansicht passt sich automatisch an

### Filter anwenden:
1. Auf **Filter-Icon** (🔍) klicken
2. Nach Area, Region oder Team filtern
3. "Anwenden"

### Nur freie Kapazitäten anzeigen:
- In der KAPA-Call Tabelle die Checkbox **"Nur freie Kapazitäten"** aktivieren

## 📊 Datenstruktur

### LocalStorage Keys:
- `kapa_employees` - Mitarbeiter-Stammdaten
- `kapa_skills` - Skills (editierbar!)
- `kapa_capacity_plan` - Kapazitätsplanung (9 Wochen)
- `kapa_projects` - Projekt-Stammdaten
- `kapa_utilization` - Utilization-Daten (HR Mock)
- `kapa_settings` - Ampel-Schwellwerte
- `kapa_initialized` - Initialisierungs-Flag

### Daten zurücksetzen:
```javascript
// In Browser-Konsole (F12):
localStorage.clear();
location.reload();
```

## 🎨 Farbcodierung

### Projekt-Status (Team Viewer):
- 🟦 **Blau (Accept):** Fest gebucht
- 🟨 **Gelb (Emphasized):** Option/Lead
- 🔴 **Rot (Reject):** Überbucht (>5 Tage/Woche)

### Ampel-Status (Mitarbeiter):
- 🟢 **Grün:** Planung entspricht historischer Utilization (±5% Standard)
- 🟡 **Gelb:** Leichte Abweichung (±5-15% Standard)
- 🔴 **Rot:** Kritische Abweichung (>±15% Standard)

### Skills:
- **Blau:** Standard-Skills (vordefiniert)
- **Gelb:** Custom Skills (benutzerdefiniert)

## 🧪 Test-Daten

Der Prototyp enthält **20 Mitarbeiter** mit realistischen Daten:
- 5 verschiedene Areas (APRA, AS, BC, CX, ES)
- 6 Regionen (München, Hamburg, Zürich, Mainz, Düsseldorf, etc.)
- 8 Teams
- 18 Projekte
- 38 Standard-Skills
- Kapazitätsplanung für 9 Wochen (KW 10-18)

## 🔧 Entwicklung

### Projekt-Struktur:
```
kapa-app-prototype/
├── index.html              # Haupt-HTML mit SAPUI5 Bootstrap
├── css/
│   └── custom.css         # Custom Fiori Styles
├── js/
│   ├── app.js             # Main App (UI Components)
│   ├── storage.js         # LocalStorage Management
│   ├── calculations.js    # Ampel-Logik, Aggregationen
│   └── skillManager.js    # Skill CRUD-Funktionen
├── data/
│   ├── employees.json     # 20 Mitarbeiter
│   ├── skills.json        # 38 Skills
│   ├── projects.json      # 18 Projekte
│   ├── capacityPlan.json  # Kapazitätsplanung
│   └── utilization.json   # HR Utilization-Daten
└── README.md
```

### Code-Anpassungen:

**Neue Mock-Daten hinzufügen:**
1. JSON-Dateien in `/data` bearbeiten
2. LocalStorage löschen (`localStorage.clear()`)
3. Seite neu laden

**Ampel-Logik ändern:**
- Siehe `js/calculations.js` → `calculateAmpelStatus()`

**UI anpassen:**
- Siehe `js/app.js` → UI-Komponenten-Funktionen
- CSS: `css/custom.css`

## 📝 Bekannte Einschränkungen

- ❌ Keine Backend-Anbindung (nur LocalStorage)
- ❌ HR-System Integration gemockt
- ❌ Export-Funktionen nicht implementiert
- ❌ Filter-Funktion teilweise implementiert
- ❌ Mobile-Optimierung basic
- ❌ Keine Authentifizierung

## 🚀 Nächste Schritte (Full-Stack)

Für einen produktiven Full-Stack Prototyp:

1. **Backend:** SAP Cloud Application Programming Model (CAP)
2. **Datenbank:** SAP HANA Cloud
3. **API:** OData V4 Services
4. **Integration:** HR-System REST API
5. **Auth:** SAP XSUAA (BTP)
6. **Deployment:** SAP Business Technology Platform (Cloud Foundry)

## 🐛 Troubleshooting

### Problem: Seite lädt nicht / Weiße Seite
**Lösung:** 
- Browser-Konsole öffnen (F12) → Fehler prüfen
- CORS-Fehler? → Lokalen Webserver verwenden
- Cache löschen: Strg+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Problem: Skills werden nicht gespeichert
**Lösung:**
- LocalStorage-Quota prüfen (Browser-Einstellungen)
- Inkognito-Modus vermeiden (LocalStorage wird gelöscht)

### Problem: Ampel zeigt immer Grau
**Lösung:**
- Utilization-Daten prüfen: `localStorage.getItem('kapa_utilization')`
- Capacity-Plan prüfen: `localStorage.getItem('kapa_capacity_plan')`

### Problem: SAPUI5 lädt nicht
**Lösung:**
- Internet-Verbindung prüfen (CDN-Zugriff erforderlich)
- Alternative: SAPUI5 lokal herunterladen und einbinden

## 📧 Support

Bei Fragen oder Problemen:
- Browser-Konsole (F12) öffnen und Fehler prüfen
- LocalStorage-Daten exportieren: `KAPAStorage.export()`

## 📄 Lizenz

Prototyp für interne Verwendung - CNT Management Consulting AG

---

**Version:** 1.0  
**Erstellt:** März 2026  
**Status:** Funktionaler Prototyp  
**Browser:** Chrome/Edge empfohlen

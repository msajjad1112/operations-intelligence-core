# SME Operations Core: Google Apps Script Boilerplate

En serverløs, real-time QC og compliance automatisering system til producerende SME'er. Dette boilerplate demonstrerer hvordan du transformerer papirbaserede eller Excel-afhængige operationer til et intelligent, revisionsspor-system ved hjælp af Google Workspace.

## 🎯 Problemet

I produktionsmiljøer, især danske SME'er, registreres kritiske compliance- og produktionsdata typisk på papir, derefter manuelt indsat i Excel-ark—ofte med 24+ timers forsinkelse.

<table>
<tr>
<th>Udfordring</th>
<th>Nuværende Situation</th>
<th>Konsekvens</th>
</tr>
<tr>
<td>Dataforsinkelse</td>
<td>Papirformularer indsamlet ved skiftende, indtastet næste dag</td>
<td>Ledelsesbeslutninger baseret på forældet information</td>
</tr>
<tr>
<td>Compliance-risiko</td>
<td>Papirregistreringer kan gå tabt, beskadiges eller være uklare</td>
<td>Vanskelighed med at bevise compliance under revisioner (ISO 22000, FSSC 22000)</td>
</tr>
<tr>
<td>Manuel datainput</td>
<td>Teamledere bruger tid på administrative opgaver</td>
<td>Mindre tid til egentlig kvalitetsstyring og problemløsning</td>
</tr>
<tr>
<td>Ingen real-time-alarmer</td>
<td>QC-fejl opdagede under ugentlig/månedlig gennemgang</td>
<td>Begrænset evne til at tage øjeblikkelig korrigerende foranstaltning</td>
</tr>
</table>

## ✅ Løsningen

Real-time compliance-automatisering via serverløs arkitektur ved hjælp af Google Workspace—platformen der bruges af 90%+ af danske SME'er.

### Hvordan det virker

Denne arkitektur giver en højtpåvirkende, billig løsning ved hjælp af værktøjer, du allerede ejer.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Operatør (Fabriksgulv)                                     │
│       ↓ (Indsender Google Form på tablet)                   │
│  Google Forms                                               │
│       ↓ (Data gemmes øjeblikkeligt)                         │
│  Google Sheets (Din database)                               │
│       ↓ (Trigger aktiveres)                                 │
│  Google Apps Script (DENNE KODE)                            │
│       ├─→ Validerer indsendelse                             │
│       ├─→ Logger til audit-ark                              │
│       ├─→ Tjekker for fejl                                  │
│       └─→ Sender notifikation                               │
│           (Slack, e-mail, eller dashboard-opdatering)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Vigtigste Fordele

- **Data tilgængelig inden for sekunder**, ikke timer eller dage
- **Automatisk audit-spor til compliance-dokumentation**
- **Bruger værktøjer, I allerede har** (Google Workspace)
- **Ingen eksterne systemer at vedligeholde**

## 💡 Hvad denne kode gør

Filens `google-apps-script/Code.gs` i repositoriet er "hjernen" i operationen.

### 1. Uforanderlig Audit-registrering

Hver formularindsendelse logges til et separat audit-ark, der bevarer de oprindelige data præcis som indsendt. Dette er afgørende for ISO 22000, FSSC 22000 og GMP compliance.

```javascript
// Hver indsendelse gemmes permanent, præcis som indsendt
logToAuditSheet(timestamp, responseData);
```

**Hvorfor det betyder noget:** Under en revision verificerer inspektører dette audit-ark for at bekræfte korrekt QC-dokumentation.

### 2. Real-Time fejlmeddelelse

Når en QC-fejl registreres, informerer systemet straks det relevante teammedlem, ikke dage senere.

```javascript
if (responseData['Status'][0] === 'FAIL') {
  triggerSlackAlert('QSHE Channel', 
    `QC Alert: Batch ${batchId} markeret som FAIL. Operatør: ${operator}`);
}
```

**Typisk workflow:**
- **Før:** QC-fejl noteres på papir → opdages ved ugentlig gennemgang → 3-5 dages forsinkelse
- **Med dette system:** QC-fejl registreres → øjeblikkelig notifikation → kan undersøges, mens materialer stadig er tilgængelige

### 3. Robust fejlhåndtering

Hvis noget går galt (netværksproblem, Slack ikke tilgængelig), logges det, og administratorer bliver alertet. Compliance-dokumentation bliver aldrig kompromitteret.

```javascript
try {
  logToAuditSheet(timestamp, responseData);
} catch (error) {
  // Hvis audit-logning fejler, er noget alvorligt galt
  // Notificér admin, så de kan undersøge
  triggerSlackAlert('System Admin', `Audit logging failed: ${error}`);
}
```

## 🚀 Hurtig Start

En trin-for-trin guide til at implementere denne løsning på 30 minutter.

### Trin 1: Opret dit Google Sheet og formular

1. Opret et nyt Google Sheet
2. Opret en Google Form med dine QC-spørgsmål (f.eks. "Batch-ID", "Operatør", "Status [PASS/FAIL]")
3. I Form'ens "Svar"-fane, link den til dit Google Sheet

### Trin 2: Tilføj Apps Script-koden

1. I dit Google Sheet, klik **Udvidelser > Apps Script**
2. Slet al standard-kode
3. Kopier indholdet fra `google-apps-script/Code.gs` (fra dette repo) ind i editoren
4. Opdater `SLACK_WEBHOOK_URL` og `AUDIT_LOG_SHEET_NAME` variablerne
5. Klik "Gem"

### Trin 3: Opsæt udløseren

1. I Apps Script-editoren, klik på "Udløsere" (ur-ikonet) i venstre side
2. Klik "Tilføj udløser" nederst til højre
3. Vælg funktion: `onGMPCheckSubmit`
4. Vælg hændelsestype: Fra regneark
5. Vælg hændelsestype: Ved formularindsendelse
6. Klik "Gem" og godkend tilladelserne

### Trin 4: Test

1. Indsend en test-formular med Status = "FAIL"
2. Tjek din Slack-kanal for en notifikation
3. Verificer, at dit "Audit_Log_Immutable"-ark har den nye række

## Skalering: Næste Niveau med Firebase

Denne `Code.gs` løsning er perfekt til 90% af SME-tilfælde. Når mængden vokser, eller hvis du har brug for en helt tilpasset operatør-grænseflade (en React-app), er det næste logiske skridt at erstatte Google Sheets med Firebase.

<table>
<tr>
<th>Komponent</th>
<th>Google Sheets (Dette Repo)</th>
<th>Firebase (Næste Niveau)</th>
</tr>
<tr>
<td>Database</td>
<td>Google Sheet</td>
<td>Firestore eller Realtime Database</td>
</tr>
<tr>
<td>Logik</td>
<td>Google Apps Script</td>
<td>Google Cloud Functions (serverløs)</td>
</tr>
<tr>
<td>Input</td>
<td>Google Forms</td>
<td>Brugerdefineret React App</td>
</tr>
<tr>
<td>Fordel</td>
<td>Ekstremt lav pris, hurtig opsætning</td>
<td>Håndterer millioner af inputs, fuldt skalerbar</td>
</tr>
</table>

Min "Kerne-Kompetencer" på mit portfolio demonstrerer erfaring med begge arkitekturer.

## 🔧 Teknologi Stack

<table>
<tr>
<th>Komponent</th>
<th>Teknologi</th>
<th>Hvorfor?</th>
</tr>
<tr>
<td>Beregning</td>
<td>Google Apps Script (V8 Runtime)</td>
<td>Serverløs, kører på Google-infrastruktur</td>
</tr>
<tr>
<td>Database</td>
<td>Google Sheets API</td>
<td>Allerede brugt af de fleste SME'er</td>
</tr>
<tr>
<td>Formular Input</td>
<td>Google Forms</td>
<td>Simpel UI, fungerer på tablets/telefoner</td>
</tr>
<tr>
<td>Notifikationer</td>
<td>Slack API (valgfrit)</td>
<td>Real-time alarmer eller brug e-mail i stedet</td>
</tr>
<tr>
<td>Audit Trail</td>
<td>Beskyttet Google Sheets</td>
<td>Compliance-dokumentation, uforanderlige registreringer</td>
</tr>
<tr>
<td>Dashboard</td>
<td>Looker Studio (valgfrit)</td>
<td>Ledelsessynlighed i QC-tendenser</td>
</tr>
</table>

## 📞 Spørgsmål?

- **GitHub:** Åbn et "Issue" for tekniske spørgsmål

## 📄 Licens

MIT License — Se LICENSE-fil for detaljer.

**Bygget af:** Sajjad Sarfraz  
**Sidste opdatering:** November 2025

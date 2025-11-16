# SME Operations Core: Google Apps Script Boilerplate

A serverless, real-time QC and compliance automation system for manufacturing SMEs. This boilerplate demonstrates how to transform paper-based or Excel-dependent operations into an intelligent, audit-trail system using Google Workspace.


## 🎯 The Problem

In manufacturing environments, especially Danish SMEs, critical compliance and production data is typically captured on paper, then manually entered into Excel sheets—often with a 24+ hour delay.

<table>
<tr>
<th>Challenge</th>
<th>Current State</th>
<th>Consequence</th>
</tr>
<tr>
<td>Data Lag</td>
<td>Paper forms collected at shift end, entered next day</td>
<td>Management decisions based on outdated information</td>
</tr>
<tr>
<td>Compliance Risk</td>
<td>Paper records can be misplaced, damaged, or unclear</td>
<td>Difficulty proving compliance during audits (ISO 22000, FSSC 22000)</td>
</tr>
<tr>
<td>Manual Data Entry</td>
<td>Team leaders spend time on administrative tasks</td>
<td>Less time for actual quality management and problem-solving</td>
</tr>
<tr>
<td>No Real-Time Alerts</td>
<td>QC failures discovered during weekly/monthly review</td>
<td>Limited ability to take immediate corrective action</td>
</tr>
</table>

## ✅ The Solution

Real-time compliance automation via serverless architecture, using Google Workspace—the platform already used by 90%+ of Danish SMEs.

### How It Works

This architecture provides a high-impact, low-cost solution using tools you already own.

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

### Key Benefits

- **Data available within seconds**, not hours or days
- **Automatisk audit-spor til compliance-dokumentation**
- **Bruger værktøjer, I allerede har** (Google Workspace)
- **Ingen eksterne systemer at vedligeholde**

## 💡 What This Code Does

The repository's `google-apps-script/Code.gs` file is the "brain" of the operation.

### 1. Immutable Audit Logging

Every form submission is logged to a separate audit sheet that preserves the original data exactly as submitted. This is essential for ISO 22000, FSSC 22000, and GMP compliance.

```javascript
// Hver indsendelse gemmes permanent, præcis som indsendt
logToAuditSheet(timestamp, responseData);
```

**Why it matters:** Under en audit verificerer inspektører dette audit-ark for at bekræfte korrekt QC-dokumentation.

### 2. Real-Time Failure Notification

When a QC failure is recorded, the system immediately notifies the relevant team member, not days later.

```javascript
if (responseData['Status'][0] === 'FAIL') {
  triggerSlackAlert('QSHE Channel', 
    `QC Alert: Batch ${batchId} markeret som FAIL. Operatør: ${operator}`);
}
```

**Typical workflow:**
- **Før:** QC-fejl noteres på papir → opdages ved ugentlig gennemgang → 3-5 dages forsinkelse
- **Med dette system:** QC-fejl registreres → øjeblikkelig notifikation → kan undersøges, mens materialer stadig er tilgængelige

### 3. Robust Error Handling

If something goes wrong (network issue, Slack unavailable), the system logs it and alerts administrators. Compliance documentation is never compromised.

```javascript
try {
  logToAuditSheet(timestamp, responseData);
} catch (error) {
  // Hvis audit-logning fejler, er noget alvorligt galt
  // Notificér admin, så de kan undersøge
  triggerSlackAlert('System Admin', `Audit logging failed: ${error}`);
}
```

## 🚀 Quick Start

En trin-for-trin guide til at implementere denne løsning på 30 minutter.

### Step 1: Create your Google Sheet & Form

1. Opret et nyt Google Sheet
2. Opret en Google Form med dine QC-spørgsmål (f.eks. "Batch ID", "Operatør", "Status [PASS/FAIL]")
3. I Form'ens "Svar"-fane, link den til dit Google Sheet

### Step 2: Add the Apps Script code

1. I dit Google Sheet, klik **Extensions > Apps Script**
2. Slet alt standard-kode
3. Kopier indholdet fra `google-apps-script/Code.gs` (fra dette repo) ind i editoren
4. Opdater `SLACK_WEBHOOK_URL` og `AUDIT_LOG_SHEET_NAME` variablerne
5. Klik "Gem"

### Step 3: Set up the trigger

1. I Apps Script-editoren, klik på "Udløsere" (ur-ikonet) i venstre side
2. Klik "Tilføj udløser" nederst til højre
3. Vælg funktion: `onGMPCheckSubmit`
4. Vælg hændelsestype: Fra regneark
5. Vælg hændelsestype: Ved formularindsendelse
6. Klik "Gem" og godkend tilladelserne

### Step 4: Test

1. Indsend en test-formular med Status = "FAIL"
2. Tjek din Slack-kanal for en notifikation
3. Verificer, at dit "Audit_Log_Immutable"-ark har den nye række

## Scaling Up: The Next Level with Firebase

This `Code.gs` solution is perfect for 90% of SME use cases. When volume grows, or if you need a fully custom operator-interface (en React-app), the next logical step is to replace Google Sheets with Firebase.

<table>
<tr>
<th>Component</th>
<th>Google Sheets (This Repo)</th>
<th>Firebase (Next Level)</th>
</tr>
<tr>
<td>Database</td>
<td>Google Sheet</td>
<td>Firestore or Realtime Database</td>
</tr>
<tr>
<td>Logic</td>
<td>Google Apps Script</td>
<td>Google Cloud Functions (serverless)</td>
</tr>
<tr>
<td>Input</td>
<td>Google Forms</td>
<td>Custom React App</td>
</tr>
<tr>
<td>Fordel</td>
<td>Ekstremt lav pris, hurtig opsætning</td>
<td>Håndterer millioner af inputs, fuldt skalerbar</td>
</tr>
</table>

My "Kerne-Kompetencer" på mit portfolio demonstrerer erfaring med begge arkitekturer.

## 🔧 Technical Stack

<table>
<tr>
<th>Component</th>
<th>Technology</th>
<th>Why?</th>
</tr>
<tr>
<td>Compute</td>
<td>Google Apps Script (V8 Runtime)</td>
<td>Serverless, runs on Google infrastructure</td>
</tr>
<tr>
<td>Database</td>
<td>Google Sheets API</td>
<td>Already used by most SMEs</td>
</tr>
<tr>
<td>Form Input</td>
<td>Google Forms</td>
<td>Simple UI, works on tablets/phones</td>
</tr>
<tr>
<td>Notifications</td>
<td>Slack API (optional)</td>
<td>Real-time alerts, or use email instead</td>
</tr>
<tr>
<td>Audit Trail</td>
<td>Protected Google Sheets</td>
<td>Compliance documentation, immutable records</td>
</tr>
<tr>
<td>Dashboard</td>
<td>Looker Studio (optional)</td>
<td>Management visibility into QC trends</td>
</tr>
</table>

## 📞 Questions?

- **GitHub:** Åbn et "Issue" for tekniske spørgsmål
- **Case Study:** Se den fulde case study på.

## 📄 License

MIT License — See LICENSE file for details.

**Built by:** Sajjad Sarfraz  
**Last updated:** November 2025

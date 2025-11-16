/**
 * @file Code.gs
 * @description Core logic for handling GMP/QC check submissions from a Google Form.
 * This script is triggered 'onFormSubmit' by the connected Google Sheet.
 * This is a boilerplate example for portfolio demonstration.
 */

// --- GLOBAL CONFIGURATION ---
// Replace with your actual webhook URLs and sheet names
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
const AUDIT_LOG_SHEET_NAME = 'Audit_Log_Immutable';

/**
 * Main trigger function. This is executed by Google Sheets
 * every time a new form is submitted.
 *
 * @param {Object} e The event object passed by the onFormSubmit trigger.
 */
function onGMPCheckSubmit(e) {
  // Get the data from the event object
  // e.g., { "Batch ID": "B-451", "Status": "FAIL", "Operator": "s.sarfraz" }
  const responseData = e.namedValues;
  const timestamp = new Date();

  // 1. DATA IMMUTABILITY: Log every single submission to a separate, locked audit trail.
  // This is critical for ISO/FSSC compliance.
  try {
    logToAuditSheet(timestamp, responseData);
  } catch (error) {
    Logger.log(`Failed to write to audit log: ${error}`);
    // Send a high-priority alert to admin, as compliance is broken
    triggerSlackAlert('System Admin', `CRITICAL ERROR: Failed to write to Audit Log. ${error}`);
  }

  // 2. COMPLIANCE CHECK: Immediate validation and alerting.
  // (On paper: this happens during a month-end audit, when it's too late)
  if (responseData['Status'][0] === 'FAIL') {
    
    // Trigger an immediate alert to the QSHE Manager
    const batchId = responseData['Batch ID'][0];
    const operator = responseData['Operator'][0];
    const message = `CRITICAL QC ALERT: Batch *${batchId}* was marked as *FAIL* by *${operator}*. Immediate action required.`;
    
    triggerSlackAlert('QSHE Channel', message);

    // This function could also stop a production line, email a supervisor, etc.
    // Return a response (if this were an API)
    // return { status: 200, action: "STOP_PRODUCTION_LINE" };
  }

  // 3. (Optional) Data Cleanup/Formatting
  // You could add code here to format dates, parse numbers, etc.

  Logger.log('GMP Check processed successfully.');
  // return { status: 200, action: "CONTINUE" };
}

/**
 * Logs a verified entry to the immutable audit log sheet.
 * For true immutability, this sheet should have protected ranges.
 *
 * @param {Date} timestamp The timestamp of the event.
 * @param {Object} data The complete data object from the form submission.
 */
function logToAuditSheet(timestamp, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(AUDIT_LOG_SHEET_NAME);
  
  if (!logSheet) {
    throw new Error(`Sheet "${AUDIT_LOG_SHEET_NAME}" not found.`);
  }

  // Flatten the data object for appending (order doesn't matter as much as data integrity)
  const operator = data['Operator'][0] || 'Unknown';
  const batchId = data['Batch ID'][0] || 'Unknown';
  const status = data['Status'][0] || 'Unknown';
  // You would add all other fields here
  
  logSheet.appendRow([timestamp, operator, batchId, status]);
}

/**
 * Triggers a simple notification to a Slack channel via Webhook.
 *
 * @param {string} channel The (symbolic) channel name or recipient.
 * @param {string} message The text message to send.
 */
function triggerSlackAlert(channel, message) {
  // 'channel' is symbolic here, as the webhook URL defines the destination.
  // For multiple channels, you'd use multiple URLs.
  
  const payload = {
    'text': message,
    'username': 'Fabriks-Alarm',
    'icon_emoji': ':warning:'
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
  } catch (error) {
    Logger.log(`Failed to send Slack alert: ${error}`);
  }
}

// =============================================================================
// Google Apps Script — Sedza & Lila Wedding RSVP
// =============================================================================
// Setup:
//   1. Open script.google.com → New project, paste this file
//   2. Deploy → New Deployment → Web App
//        Execute as: Me
//        Who has access: Anyone
//   3. Copy the deployment URL into js/rsvp.js as APPS_SCRIPT_URL
//
// Google Sheet requirements:
//   - Sheet tab named exactly: Guests
//   - Row 1 is headers (skipped)
//   - Column A: Guest Name
//   - Column B: Unique Code  (legacy — no longer used for matching)
//   - A column headed exactly "New Code" holds the active invite codes
//     (6-char uppercase, e.g. X7K2PQ). Matching is done against this column.
//   - Column C: RSVP Status  (written by this script: "Attending" or "Declined")
//   - Column D: Message      (written by this script)
//   - Column E: Timestamp    (written by this script, ISO 8601)
//   - Column F: Notes        (manager use only, never touched by script)
//
// Code generation formula for column B (paste, then copy → Paste as value):
//   =UPPER(LEFT(DEC2HEX(RANDBETWEEN(0,16777215)),6))
// =============================================================================

/**
 * Handles all GET requests.
 * ?action=lookup&code=X7K2PQ  → validate code, return guest name
 * ?action=submit&code=X7K2PQ&rsvp=Attending&message=...  → record RSVP
 */
function doGet(e) {
  const action = e.parameter.action || 'lookup';
  const code   = (e.parameter.code  || '').trim().toUpperCase();

  if (!code) {
    return json({ success: false, error: 'No code provided' });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');

  if (!sheet) {
    return json({ success: false, error: 'Sheet "Guests" not found' });
  }

  const rows = sheet.getDataRange().getValues();

  // Only codes from the "New Code" column are accepted. Locate it by header
  // name so it works regardless of which column it was added as.
  const headers = rows[0].map(function (h) { return h.toString().trim().toLowerCase(); });
  const codeCol = headers.indexOf('new code');

  if (codeCol === -1) {
    return json({ success: false, error: '"New Code" column not found' });
  }

  // ── Lookup ────────────────────────────────────────────────────────────────
  if (action === 'lookup') {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][codeCol].toString().trim().toUpperCase() === code) {
        return json({
          success : true,
          name    : rows[i][0],
          rsvp    : rows[i][2] || ''   // existing RSVP status, if any
        });
      }
    }
    return json({ success: false, error: 'Code not found' });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  if (action === 'submit') {
    const rsvp    = e.parameter.rsvp    || '';
    const message = e.parameter.message || '';

    if (!rsvp) {
      return json({ success: false, error: 'No RSVP value provided' });
    }

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][codeCol].toString().trim().toUpperCase() === code) {
        sheet.getRange(i + 1, 3).setValue(rsvp);
        sheet.getRange(i + 1, 4).setValue(message);
        sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
        return json({ success: true });
      }
    }
    return json({ success: false, error: 'Code not found' });
  }

  return json({ success: false, error: 'Unknown action: ' + action });
}

/** Helper: return a JSON response */
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

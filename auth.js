const { google } = require('googleapis');

const serviceAccountJSON = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
if (!serviceAccountJSON) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_B64 environment variable");
}

let credentials;
try {
  credentials = JSON.parse(Buffer.from(serviceAccountJSON, 'base64').toString('utf-8'));
} catch (err) {
  throw new Error("Invalid base64 or JSON in GOOGLE_SERVICE_ACCOUNT_B64: " + err.message);
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets'
  ]
});

module.exports = auth;

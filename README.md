# Bear Drive Plugin

This project is a custom ChatGPT plugin server for managing Google Drive, Sheets, and Docs.

## Features

- 📁 Create, delete, move, share, and label files/folders
- 📝 Create and update Google Docs
- 📊 Create, write to, and read from Google Sheets
- 🔒 OAuth2 Google authentication

## Setup

1. Install dependencies:
    ```bash
    npm install
    ```

2. Copy the example env file and update your credentials:
    ```bash
    cp .env.example .env
    ```

3. Run the server:
    ```bash
    npm start
    ```

## API Endpoints

- `POST /createFolder`
- `POST /deleteFile`
- `POST /moveFile`
- `POST /shareFile`
- `GET /listFiles`
- `POST /createSheet`
- `POST /writeToSheet`
- `POST /readFromSheet`
- `POST /createDoc`
- `POST /updateDocContent`
- `POST /addLabels`

---

Built with 🐻 by Bear Sized.

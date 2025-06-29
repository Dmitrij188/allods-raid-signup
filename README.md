# Allods Raid Signup

This project provides a simple web interface and a Google Apps Script backend for collecting raid signup information.

## Deploying `raid-api.gs`

1. Open **raid-api.gs** in Google Apps Script.
2. Click **Deploy** > **New deployment**.
3. Select **Web app** as the deployment type.
4. Set **Who has access** to **Anyone** so that the script can be called from the frontend.
5. Deploy the project and copy the Web App URL that is generated.

## Updating `script.js`

Edit the `scriptURL` constant at the top of **script.js** and replace the current link with the Web App URL you copied when deploying `raid-api.gs`.

```
const scriptURL = 'YOUR_WEB_APP_URL_HERE';
```

## Spreadsheet setup

`raid-api.gs` expects a sheet named `Лист1` in the active spreadsheet. If your sheet has a different name, update the `SHEET_NAME` constant in **raid-api.gs** accordingly:

```
const SHEET_NAME = 'YourSheetName';
```

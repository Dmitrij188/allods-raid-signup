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

### CORS considerations

Google Apps Script doesn't expose an `OPTIONS` handler, so preflight
requests won't reach your code. The platform automatically sends the
`Access-Control-Allow-Origin` header for Web App responses. Avoid custom
request headers (such as `Content-Type: application/json`) so the
browser issues a *simple* CORS request. The included `script.js`
already omits this header when calling the Apps Script.

## Spreadsheet setup

`raid-api.gs` expects a sheet named `Лист1` in the active spreadsheet. If your sheet has a different name, update the `SHEET_NAME` constant in **raid-api.gs** accordingly:

```
const SHEET_NAME = 'YourSheetName';
```
Allods Raid Signup
This project provides a static web page for coordinating raid signups in Allods Online. A small Google Apps Script backend stores registrations in a Google Sheet.

Basic Setup
Deploy the Apps Script

Create a new script on script.google.com and copy the contents of raid-api.gs from this repository.
Deploy the project as a Web app with execution access set to Me and visibility set to Anyone (or Anyone, even anonymous).
After deployment, copy the Web app URL – you'll need it below.
Prepare the Google Sheet

The script expects a sheet named Лист1 with the following header columns in order:
Name
Class
Role
Secondary Role
Tertiary Role
Raid ID
Level
GearScore
Guild
Faction
Server
Ensure the sheet contains at least these columns before calling appendRow. If getMaxColumns() is lower than the payload length, insert new columns with insertColumnsAfter to avoid data loss.
Update index.html

Locate the line containing scriptURL:
const scriptURL = 'https://script.google.com/macros/......';
Replace the placeholder with the Web app URL from step 1.
Host the site

Serve index.html and its assets from any static hosting service (GitHub Pages, Netlify, etc.). The page will communicate with your Apps Script to save and load raid signups.
Usage
Open the hosted page in a browser. Players can enter their character name, class, roles and server to sign up. The roster is loaded from the Google Sheet, so multiple users can see updates in real time after refreshing the page.

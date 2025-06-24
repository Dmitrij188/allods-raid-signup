# Allods Raid Signup

This repository contains a static site for organizing raid signups in the game *Allods Online* along with a Google Apps Script backend.

## Deploying the Google Apps Script

1. Open [`raid-api.gs`](raid-api.gs) in [Google Apps Script](https://script.google.com/).
2. Click **Deploy → New deployment**.
3. Choose **Web app** as the deployment type.
4. Under **Execute as**, select **Me**.
5. Under **Who has access**, select **Anyone** (or **Anyone, even anonymous**).
6. Deploy and authorize if prompted, then copy the **Web app URL** that is shown.

Before calling `appendRow` in your script, verify that the sheet has enough
columns for every value. Use `sheet.getMaxColumns()` and insert columns if the
count is lower than the payload length using `sheet.insertColumnsAfter`. When
the sheet is too narrow, `appendRow` quietly drops the later fields of the row.

## Updating `index.html`

1. Open [`index.html`](index.html) and locate the line containing `scriptURL`.
   It looks like:
   ```html
   const scriptURL = 'https://script.google.com/macros/......';
   ```
2. Replace the placeholder URL with the **Web app URL** from the deployment step.
3. Save the file and commit the change.

## Hosting the Site

The project only requires a static host for `index.html` and its assets. One option is **GitHub Pages**:

1. Push the repository to GitHub.
2. In your repository settings, enable **GitHub Pages** and choose the branch and folder containing `index.html` (typically the root).
3. After GitHub builds the site, visit the provided Pages URL to access the raid signup page.

Any static hosting service (Netlify, Vercel, etc.) can be used as long as the final `index.html` references the deployed Apps Script URL.

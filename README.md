# Allods Raid Signup

This repository contains a static site for organizing raid signups in the game *Allods Online* along with a Google Apps Script backend.

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

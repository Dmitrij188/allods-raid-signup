# Allods Raid Signup

This project provides a static web page for coordinating raid signups in **Allods Online**. A small Google Apps Script backend stores registrations in a Google Sheet.

## Basic Setup

1. **Deploy the Apps Script**
   - Create a new script on [script.google.com](https://script.google.com/) and copy the contents of `raid-api.gs` from this repository.
   - Deploy the project as a **Web app** with execution access set to **Me** and visibility set to **Anyone** (or **Anyone, even anonymous**).
   - After deployment, copy the **Web app URL** – you'll need it below.

2. **Prepare the Google Sheet**
   - The script expects a sheet named `Лист1` with the following header columns in order:
     1. `Name`
     2. `Class`
     3. `Role`
     4. `Secondary Role`
     5. `Tertiary Role`
     6. `Raid ID`
     7. `Level`
     8. `GearScore`
     9. `Guild`
    10. `Faction`
    11. `Server`
   - Ensure the sheet contains at least these columns before calling `appendRow`. If `getMaxColumns()` is lower than the payload length, insert new columns with `insertColumnsAfter` to avoid data loss.

3. **Update `index.html`**
   - Locate the line containing `scriptURL`:
     ```html
     const scriptURL = 'https://script.google.com/macros/......';
     ```
   - Replace the placeholder with the Web app URL from step 1.

4. **Host the site**
   - Serve `index.html` and its assets from any static hosting service (GitHub Pages, Netlify, etc.). The page will communicate with your Apps Script to save and load raid signups.

## Usage

Open the hosted page in a browser. Players can enter their character name, class, roles and server to sign up. The roster is loaded from the Google Sheet, so multiple users can see updates in real time after refreshing the page.

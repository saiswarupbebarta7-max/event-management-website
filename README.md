# Gather – Event Management Website

Task: **Design and Develop a Responsive Event Management Website** (K Explore – Web Designing).

**Live site:** _add your Vercel / Netlify / GitHub Pages link here_

## What it does
- **Hero section** introducing the platform, with a live countdown to the next event.
- **Event cards** showing name, date, venue, image and a short description.
- **Search** (name, venue, category, description) and **category filters**, with an empty state.
- **Event details** in a modal with a registration form (name, email, phone, selected event).
- **JavaScript form validation** with inline error messages: name (letters only, 3–50), email format, Indian 10-digit mobile number, event required, duplicate-registration check.
- **Confirmation message** with a reference number after a successful registration.
- **Responsive** layout for mobile, tablet and desktop (CSS Grid, Flexbox, mobile menu).

### Bonus challenges
- Dark / light mode (remembers your choice, respects system preference)
- Event countdown timer
- Animations and smooth transitions (reduced-motion respected)
- Local Storage registration management: seats left update, "My registrations" list, cancel option

## Tech stack
HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript (ES6). No build step.

## Project structure
```
index.html
css/style.css
js/script.js
README.md
```

## Run locally
Open `index.html` in a browser, or use VS Code Live Server.

## Deploy
**GitHub Pages:** push the repo, then Settings → Pages → Deploy from branch `main` / root.
**Netlify / Vercel:** import the GitHub repo; no build command, publish directory is the root.

## Git commands
```
git init
git add .
git commit -m "Add Gather event management website"
git branch -M main
git remote add origin https://github.com/<your-username>/event-management-website.git
git push -u origin main
```

## Notes
- Event data lives in the `EVENTS` array at the top of `js/script.js`. Dates are generated relative to today so events always stay upcoming.
- Event images come from picsum.photos; a gradient shows if an image fails to load.
- Registrations are stored only in the visitor's browser (Local Storage).

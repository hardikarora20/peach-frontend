# Peach – frontend v3

React + Vite frontend for the Peach dating app (Spring Boot backend).

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL if the backend isn't on http://localhost:8080
npm run dev               # http://localhost:5173
```

## Layout

| Screen width | Layout |
|---|---|
| ≥ 1200px | Sidebar (nav + all chats) · screen · **their profile on the right inside a chat** |
| 900–1199px | Sidebar · screen · profile slides over from the right (button in the chat header) |
| < 900px | Full-screen pages, floating bottom nav, profile opens as a bottom sheet |

## What's new in v3

- New visual direction: dark-first plum/black with a peach→rose gradient, Fraunces display type, warm "paper" light theme.
- Every screen uses the full viewport – no narrow centred columns.
- Chat: three panels on desktop, starters built from their prompts/interests, jump-to-latest button, retry on failed send.
- Discover: full-height card with photo stories (tap sides), drag to like/pass, card deck, full-screen match moment.
- One shared inbox (`context/InboxContext.jsx`) feeds the sidebar, Matches, Chats and the chat screen.
- Profiles read like a story: sticky photo gallery, big prompts, tiles for habits and preferences.
- Edit profile: section nav with checkmarks and a save bar that appears when something changes.
- Onboarding: split screen; only the basics (name, age 18+, gender, city, bio) are required.

## Project layout

```
src/
  api/client.js              axios instance + every backend endpoint
  context/                   Auth, Theme, Inbox (shared /matches data)
  hooks/useProfileForm.js    form state for onboarding + edit profile
  components/                AppShell (sidebar/bottom nav), ui kit, Sheet, PhotoGallery, profile/*
  pages/                     one file per route
  styles/                    tokens, base, components, layout, motion + one file per screen
```

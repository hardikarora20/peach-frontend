# 🍑 Peach

> **Find someone _worth_ texting back.**

Peach is a location-based dating app I built from scratch: a **Spring Boot** backend with JWT auth, and a **React + Vite** frontend that I kept redesigning until it felt like a real app and not a set of HTML pages. 😅

It started as a way to properly learn REST APIs, security and React state management. Somewhere along the way it became a project I genuinely enjoy opening. This README covers what it does, how it's built, and how to run it on your machine.

— _Hardik Arora_

---

## 📸 At a glance

|                 |                                                                           |
| --------------- | ------------------------------------------------------------------------- |
| 🧭 **Discover** | Swipe through people nearby, one full-screen card at a time               |
| 💘 **Match**    | Chat opens only when you _both_ like each other                           |
| 💬 **Chat**     | Three-panel desktop layout: your chats · the conversation · their profile |
| 🪪 **Profiles**  | Prompts, values, habits and photos that read like a story, not a form     |
| 🌗 **Themes**   | Dark (the signature look), warm light, or follow your system              |
| ✨ **Motion**   | Pages slide, cards fly, matches burst into hearts                         |

---

## ✨ Features

### 🔐 Sign in & sign up

- Email + password, with passwords stored as **BCrypt** hashes.
- A **JWT** is issued on login and sent with every request.
- When the token expires, the app logs you out cleanly and returns you to sign in, with no half-broken screens.
- If an email is already registered, you're told so in plain words.

### 🪄 Onboarding that doesn't nag

- A 5-step setup with a split-screen layout.
- **Only the basics are required:** name, age (18+), gender, city and a short bio.
- Photos, prompts, lifestyle and values are all optional. **Finish later** takes you straight to the feed.
- A missing photo **never** sends you back to onboarding. That was a real bug, and it's fixed. 🐛✅
- If the server can't be reached, you get a **Try again** screen instead of being pushed into onboarding by mistake.

### 🧭 Discover

- A full-height profile card with **story-style photos**: tap the left or right side to flip through them.
- **Drag the card** to like or pass, with live _Like_ / _Pass_ stamps and a colour tint while you drag.
- The next two cards wait behind it and move up as you swipe.
- Keyboard shortcuts: **←** to pass, **→** to like.
- A distance filter from 5 to 200 km that remembers your choice.
- On phones, the ⓘ button opens the full profile as a bottom sheet, so you don't lose your place.
- Clear states for _finding your location_, _location blocked_ and _you've seen everyone nearby_ (with a one-tap "search further").

### 💘 It's a match!

- Both photos fly in, hearts burst out, and _match_ is written in the gradient.
- One tap takes you straight into the new chat.

### 💬 Chat (my favourite part)

On a desktop it's a **three-panel layout**:

```
┌────────────┬──────────────────────────────┬──────────────────┐
│  Sidebar   │        Conversation          │  Their profile   │
│  nav +     │                              │  photos, prompts │
│  all chats │                              │  habits, values  │
└────────────┴──────────────────────────────┴──────────────────┘
```

- **Their profile is always open on the right**, so there's no "view profile" button to hunt for.
- On medium screens the profile slides in from the right; on phones it opens as a bottom sheet.
- **Conversation starters** built from _their_ prompts and interests: tap one to send it.
- Messages appear instantly while sending (✓), are confirmed once delivered (✓✓), and show **Retry** if they fail.
- Bubbles from the same person group together, with _Today_ and _Yesterday_ dividers.
- A **Jump to latest** button appears (with an "_n_ new" count) when you've scrolled up.
- Enter sends, Shift + Enter adds a new line, plus a quick emoji picker 😊.
- New messages are checked every 3 seconds, but only while the tab is open and visible.

### 💞 Matches & 📨 Chats

- **Matches:** big photo cards with _All / New / Talking_ filters, unread tags and quick Message / Profile buttons.
- **Chats:** a row of new matches you haven't messaged yet, then conversations sorted by latest activity, with search.
- The sidebar, the Matches page, the Chats page and the chat screen all share **one copy of your inbox data**, so unread badges update everywhere at once.

### 🪪 Profiles

- Photos stay fixed on the left while the profile scrolls on the right, so it reads like a story.
- Large prompt answers, your opening line, and tiles for _what you're after_ and _lifestyle_.
- Full-screen photo viewer with arrow-key navigation.
- **Your own profile** shows a profile-strength ring, a theme picker and log out.
- **Edit profile** has a section list with ✅ checkmarks that follows you as you scroll, a save bar that appears only when something changed, and a warning before you leave with unsaved edits.

### 🌗 Themes

- **Dark** is the signature look: deep plum-black with a peach → rose gradient.
- **Light** is a warm off-white version of the same palette.
- Switching themes spreads out in a **circle from wherever you clicked**. 🌀
- The saved theme loads before the page appears, so there's no white flash.

### 🎬 Motion

- Moving between pages **slides in the direction you're going**: along the nav, into a chat or profile, back out again. Chat-to-chat switches crossfade.
- Each page builds itself piece by piece: header, then cards, then lists.
- The sidebar and phone nav stay still while the page moves.
- All animation switches off for people who turn on _reduce motion_ in their system settings. ♿

### 📱 Works on every screen

| Width      | Layout                                                |
| ---------- | ----------------------------------------------------- |
| ≥ 1200px   | Sidebar · page · profile panel in chat                |
| 900–1199px | Sidebar · page · profile slides over                  |
| < 900px    | Full-screen pages, floating bottom nav, bottom sheets |

---

## 🧱 Tech stack

### Frontend

| Tech                                | What it does here                                                  |
| ----------------------------------- | ------------------------------------------------------------------ |
| ⚛️ **React 19**                     | Function components and hooks only                                 |
| ⚡ **Vite 6**                       | Dev server and production build                                    |
| 🧭 **React Router 7**               | Nested layout routes and route guards                              |
| 📡 **Axios**                        | One shared client that adds the token and handles expired sessions |
| 🎨 **lucide-react**                 | Icons                                                              |
| 💅 **Plain CSS**                    | Design tokens as CSS variables, no CSS framework                   |
| 🪄 **View Transitions API**         | Page slides and the circular theme reveal (Chrome / Edge)          |
| 🔤 **Fraunces + Plus Jakarta Sans** | Serif headings, clean sans body text                               |

### Backend

| Tech                         | What it does here                                  |
| ---------------------------- | -------------------------------------------------- |
| 🍃 **Spring Boot**           | REST API                                           |
| 🛡️ **Spring Security + JWT** | Stateless auth, BCrypt password hashing            |
| 🗄️ **Spring Data JPA**       | Entities and repositories                          |
| 💾 **H2**                    | Database with a browser console for poking at data |

---

## 🗂️ Project structure

```
peach-frontend/
├── index.html               # fonts + no-flash theme script
├── src/
│   ├── api/client.js        # 📡 every backend call lives here
│   ├── context/
│   │   ├── AuthContext.jsx  # 🔐 session, login/register/logout, profile check
│   │   ├── ThemeContext.jsx # 🌗 system / light / dark
│   │   └── InboxContext.jsx # 📨 shared matches + unread counts
│   ├── hooks/
│   │   └── useProfileForm.js# 📝 shared by onboarding + edit profile
│   ├── components/
│   │   ├── AppShell.jsx     # 🧱 sidebar, bottom nav, page transitions
│   │   ├── ProtectedRoute.jsx
│   │   ├── PhotoGallery.jsx # 📸 story-style photos + lightbox
│   │   ├── Sheet.jsx        # 📱 bottom sheet
│   │   ├── ui.jsx           # 🧩 Button, Chip, Avatar, Skeleton…
│   │   └── profile/         # 🪪 ProfileView + form sections
│   ├── pages/               # 📄 one file per screen
│   ├── utils/               # 🛠️ formatting, storage, location, transitions
│   ├── data/                # 📋 options, prompts, cities
│   └── styles/              # 🎨 tokens, layout, motion + one file per screen
```

---

## 🔌 API

All endpoints except sign in / sign up need `Authorization: Bearer <token>`.

| Method | Endpoint                            | Used for                                                        |
| ------ | ----------------------------------- | --------------------------------------------------------------- |
| `POST` | `/users`                            | Create an account                                               |
| `POST` | `/users/login`                      | Sign in → `{ token, userId }`                                   |
| `GET`  | `/profile/me`                       | Your profile                                                    |
| `PUT`  | `/profile/me`                       | Save your profile                                               |
| `GET`  | `/profile/me/exists`                | Has the profile been set up?                                    |
| `GET`  | `/profile/{profileId}`              | Someone else's profile                                          |
| `GET`  | `/profile/getId/{userId}`           | Find a profile id from a user id                                |
| `POST` | `/profile/feed`                     | People nearby → `{ xCoordinate: lat, yCoordinate: lng, range }` |
| `POST` | `/swipes`                           | Like or pass → `{ matchCreated, matchId }`                      |
| `GET`  | `/matches`                          | Your matches, last message and unread count                     |
| `GET`  | `/messages/{matchId}?markRead=true` | Messages in a chat                                              |
| `POST` | `/messages`                         | Send a message                                                  |

---

## 🚀 Running it locally

### 1️⃣ Backend

Start the Spring Boot app from your IDE (it runs on `http://localhost:8080`).

### 2️⃣ Test data (optional, but recommended 🌱)

1. Open `http://localhost:8080/h2-console` and connect.
2. Run **`peach_seed.sql`**: it clears every table and adds **30 connected people** with profiles, matches, chats, likes and passes.
3. Run **`peach_photos_update.sql`**: it gives everyone a portrait plus photos from their life (cats 🐈, chai ☕, treks 🏔️, food 🍕).

Every seed account uses the password **`123456`**. Log in as **`hardik.arora@peach.dev`** to see:

- 💬 unread chats with **Upasana** and **Rakshita**
- ⏳ a chat waiting on **Mehek**
- 🆕 brand-new matches with **Naina** and **Riya** (try the conversation starters)
- 💘 an instant match if you like **Ishita, Sanya, Zoya** or **Pooja**, who already liked you

The full list of accounts and test scenarios is in `SEED_ACCOUNTS.md`.

### 3️⃣ Frontend

```bash
cd peach-frontend
npm install
cp .env.example .env       # change VITE_API_BASE_URL if the backend isn't on :8080
npm run dev                # 👉 http://localhost:5173
```

> 💡 **Tips**
>
> - Location only works on `http://localhost` or `https://`. To test on a phone, use HTTPS or a tunnel.
> - Page slides need **Chrome or Edge**; other browsers get a simpler fade.
> - No animations at all? Check Windows → Accessibility → Visual effects → **Animation effects**.

---

## 🐛 Bugs I squashed along the way

A few I'm quietly proud of:

- 🗺️ The feed helper sent `PUT` with no body while the backend expected `POST` with coordinates.
- 📍 Latitude and longitude were sent the wrong way round.
- 🚪 Expired sessions were never logged out because nothing listened for the "unauthorised" event.
- 🧹 Logging out wiped the saved theme and distance setting too.
- 🖼️ A missing photo or a failed request sent finished users back to onboarding.
- 💥 Opening a chat whose match hadn't loaded yet crashed the page.
- 🔁 Chat was polling every second, even in background tabs.
- 📋 Onboarding and Edit profile shared about 1,200 lines of copy-pasted code; now they share one hook and one set of components.

---

## 🛣️ What's next

- [ ] 📏 Real distances: switch the feed to Haversine so "km away" is actually km
- [ ] 🛡️ Skip users without a saved location in the feed instead of failing
- [ ] 🔢 Proper status codes: 404 for a missing profile, 409 for an existing email, a clear error for a repeat swipe
- [ ] 🔑 Move the JWT secret out of the code, and add refresh tokens (tokens currently last 1 hour)
- [ ] ⚡ WebSockets for instant messages and typing indicators
- [ ] 📤 Real photo upload instead of image URLs
- [ ] 🚫 Unmatch, block and report
- [ ] 🧪 Tests: Vitest + React Testing Library, Playwright for full flows

---

## 💛 A note

Peach is a learning project, and it shows in the best way: every screen has been rebuilt at least twice. 😄 If something looks off, it probably bothered me too and is already on the list above.

Made with ☕, too many late nights and a lot of `console.log` by **Hardik Arora** 🍑

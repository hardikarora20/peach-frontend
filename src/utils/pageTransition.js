// Page-to-page animation using the browser's View Transitions API (Chrome / Edge).
// The old page is captured as a snapshot and slides out while the new one slides in.
// Browsers without the API (Firefox, older Safari) fall back to the CSS enter animation in motion.css.

const TABS = ["/app/feed", "/app/matches", "/app/conversations", "/app/profile"];

// Where a path sits in the app: which tab, and whether it's a top-level screen or a detail screen
function place(path) {
  if (path.startsWith("/app/chat/")) return { tab: 2, depth: 1 };
  if (path === "/app/editprofile") return { tab: 3, depth: 1 };
  if (path.startsWith("/app/profile/")) return { tab: -1, depth: 1 }; // someone else's profile, reached from anywhere
  return { tab: TABS.indexOf(path), depth: 0 };
}

// forward = slide in from the right, back = from the left, fade = same level (e.g. chat → chat)
export function directionFor(from, to) {
  const a = place(from);
  const b = place(to);
  if (a.depth !== b.depth) return b.depth > a.depth ? "forward" : "back";
  if (a.tab === b.tab || a.tab < 0 || b.tab < 0) return "fade";
  return b.tab > a.tab ? "forward" : "back";
}

let pending = null; // { target, resolve } – the transition waits until this page has rendered
let lastTarget = null; // the page a transition is heading to, so AppShell skips the fallback animation

export const isTransitionTarget = (pathname) => lastTarget === pathname;

// Called by AppShell once the new page has rendered
export function pageCommitted(pathname) {
  if (lastTarget === pathname) lastTarget = null;
  if (pending && pending.target === pathname) {
    const { resolve } = pending;
    pending = null;
    resolve();
  }
}

const toPathname = (to) => (typeof to === "string" ? to : to?.pathname || "").split(/[?#]/)[0];

export function runPageTransition(from, to, commit) {
  const target = toPathname(to);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const inApp = target.startsWith("/app/") && target !== "/app/onboarding";

  if (!document.startViewTransition || reduced || !inApp || !target || target === from) {
    commit();
    return;
  }

  const root = document.documentElement;
  root.dataset.navDir = directionFor(from, target);
  lastTarget = target;
  if (pending) pending.resolve(); // a newer navigation wins

  // React Router renders navigations inside startTransition, so instead of flushSync we
  // hand the browser a promise that resolves once AppShell reports the new page is on screen.
  const transition = document.startViewTransition(
    () =>
      new Promise((resolve) => {
        pending = { target, resolve };
        commit();
        setTimeout(() => {
          if (pending?.resolve === resolve) {
            pending = null;
            resolve();
          }
        }, 450); // safety net so a slow page never freezes the screen
      })
  );
  transition.finished.finally(() => {
    if (lastTarget === target) delete root.dataset.navDir;
  });
}

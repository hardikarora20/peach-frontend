// Material-style ink ripple for every button-like element, wired once at startup.
// One delegated listener instead of a hook in every component.
const SELECTOR = [
  ".btn",
  ".icon-btn",
  ".chip--filter",
  ".segmented__btn",
  ".menu__item",
  ".prompt-option",
  ".chat-row",
  ".theme-toggle",
].join(",");

export function installRipples() {
  if (typeof window === "undefined" || window.__peachRipples) return;
  window.__peachRipples = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (reduced.matches || e.button !== 0) return;
      const host = e.target.closest(SELECTOR);
      if (!host || host.disabled || host.getAttribute("aria-disabled") === "true") return;
      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const ink = document.createElement("span");
      ink.className = "ripple";
      ink.style.width = ink.style.height = `${size}px`;
      ink.style.left = `${e.clientX - rect.left - size / 2}px`;
      ink.style.top = `${e.clientY - rect.top - size / 2}px`;
      host.appendChild(ink);
      ink.addEventListener("animationend", () => ink.remove(), { once: true });
    },
    { passive: true }
  );
}

// Dark/light mode. Tessera's dark mode is a ".dark" class on an ancestor
// (not a data attribute), so that's what this toggles.
export const THEME_KEY = "theme";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    return t === "dark" || t === "light" ? t : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getResolvedTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setStoredTheme(theme: Theme) {
  applyTheme(theme);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage unavailable — the class is still applied for this load.
  }
}

// Runs synchronously during HTML parsing, before first paint, so the page
// never flashes the wrong theme. See src/app/layout.tsx.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

// Primary color theme — Tessera's `data-primary` attribute. Only these 4
// values have matching CSS selectors in @tessera/ui's palettes.css.
export const PRIMARY_KEY = "primary";

export const PRIMARY_THEMES = [
  { value: "malachite", label: "Malachite", swatch: "var(--tsr-malachite-500)" },
  { value: "lapis", label: "Lapis", swatch: "var(--tsr-lapis-500)" },
  { value: "amethyst", label: "Amethyst", swatch: "var(--tsr-amethyst-500)" },
  { value: "carnelian", label: "Carnelian", swatch: "var(--tsr-carnelian-500)" },
] as const;

export type PrimaryTheme = (typeof PRIMARY_THEMES)[number]["value"];

const DEFAULT_PRIMARY: PrimaryTheme = "carnelian";

function isPrimaryTheme(value: string | null): value is PrimaryTheme {
  return PRIMARY_THEMES.some((t) => t.value === value);
}

export function getStoredPrimary(): PrimaryTheme {
  if (typeof window === "undefined") return DEFAULT_PRIMARY;
  try {
    const p = window.localStorage.getItem(PRIMARY_KEY);
    return isPrimaryTheme(p) ? p : DEFAULT_PRIMARY;
  } catch {
    return DEFAULT_PRIMARY;
  }
}

export function applyPrimary(primary: PrimaryTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.primary = primary;
}

export function setStoredPrimary(primary: PrimaryTheme) {
  applyPrimary(primary);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRIMARY_KEY, primary);
  } catch {
    // Storage unavailable — the attribute is still applied for this load.
  }
}

// Same pre-paint pattern as THEME_INIT_SCRIPT, for the primary color.
export const PRIMARY_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(PRIMARY_KEY)});var valid=${JSON.stringify(PRIMARY_THEMES.map((t) => t.value))};if(p&&valid.indexOf(p)!==-1)document.documentElement.setAttribute("data-primary",p)}catch(e){}})()`;

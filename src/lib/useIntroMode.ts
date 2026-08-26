"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "ffl-intro-seen";

export type IntroMode = "full" | "short";

function noSubscription() {
  return () => {};
}

function getIntroModeSnapshot(): IntroMode {
  try {
    return sessionStorage.getItem(SESSION_KEY) ? "short" : "full";
  } catch {
    return "full";
  }
}

function getIntroModeServerSnapshot(): IntroMode {
  return "full";
}

/**
 * "full" = first time this session (or sessionStorage unavailable) → play
 * the whole opening. "short" = the opening has already played once this
 * session → play the condensed replay instead. The server snapshot is
 * always "full", matching the very first frame (darkness) either way, so
 * there is never a hydration mismatch.
 */
export function useIntroMode(): IntroMode {
  return useSyncExternalStore(noSubscription, getIntroModeSnapshot, getIntroModeServerSnapshot);
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore — worst case the full intro just plays again next time.
  }
}

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/** Server/first-paint snapshot is always false; the real value attaches once matchMedia is available client-side. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

const DESKTOP_QUERY = "(min-width: 1024px)"; // matches Tailwind's lg breakpoint used by HomeFinal/HomeFinalMobile

function subscribeDesktopViewport(callback: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getDesktopViewportSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getDesktopViewportServerSnapshot(): boolean {
  return false;
}

/**
 * Used only to decide which single opening overlay to mount, so the
 * inactive one's timers/AudioContext never run in the background — unlike
 * HomeFinal/HomeFinalMobile's plain CSS hide, which is cheap enough (static
 * markup) not to need this.
 */
export function useIsDesktopViewport(): boolean {
  return useSyncExternalStore(subscribeDesktopViewport, getDesktopViewportSnapshot, getDesktopViewportServerSnapshot);
}

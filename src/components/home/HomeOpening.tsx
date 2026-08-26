"use client";

import { useIsDesktopViewport } from "@/lib/useIntroMode";
import { HomeOpeningDesktop } from "./HomeOpeningDesktop";
import { HomeOpeningMobile } from "./HomeOpeningMobile";

/**
 * Mounts exactly one of the two opening overlays based on viewport — unlike
 * HomeFinal/HomeFinalMobile (always both, CSS-hidden), so the inactive
 * design's timers/AudioContext never run in the background.
 */
export function HomeOpening() {
  const isDesktop = useIsDesktopViewport();
  return isDesktop ? <HomeOpeningDesktop /> : <HomeOpeningMobile />;
}

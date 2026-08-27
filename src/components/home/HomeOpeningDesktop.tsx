"use client";

import { OpeningSequence } from "./OpeningSequence";

/** PC HOME opening — SCENE 01–10, built from the 10 approved master images (public/home/opening). */
export function HomeOpeningDesktop() {
  return <OpeningSequence exitDurationMs={800} />;
}

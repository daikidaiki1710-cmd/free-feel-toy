"use client";

import { OpeningSequence } from "./OpeningSequence";

/** Mobile HOME opening — SCENE 01–10, built from the same 10 approved master images (public/home/opening) as PC. */
export function HomeOpeningMobile() {
  return <OpeningSequence exitDurationMs={700} />;
}

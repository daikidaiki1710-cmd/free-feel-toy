import type { Metadata } from "next";
import { LivingHero } from "@/components/living/LivingHero";
import { LivingSupport } from "@/components/living/LivingSupport";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "LIVING | Free Feel Toy",
  description: "住まい・暮らし・片付け・生活支援。暮らしの中の「ちょっと困った」を、必要な分だけお手伝い。",
};

export default function LivingPage() {
  return (
    <main>
      {/* Desktop only for now — mobile finals not yet provided (docs/design-tokens.md). */}
      <div className="hidden lg:block">
        <LivingHero />
        <Reveal>
          <LivingSupport />
        </Reveal>
      </div>
    </main>
  );
}

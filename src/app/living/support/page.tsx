import type { Metadata } from "next";
import { LivingHero } from "@/components/living/LivingHero";
import { LivingSupport } from "@/components/living/LivingSupport";
import { LivingMobileSupport } from "@/components/living/LivingMobileSupport";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "暮らしのサポート | LIVING | Free Feel Toy",
  description: "LIVING 暮らしのサポート — 家の中のこと、外まわりのこと、代行・見守りのこと。日常の困りごとを、必要な分だけお手伝い。",
};

export default function LivingSupportPage() {
  return (
    <main>
      {/* Desktop: no separate PC design has been approved for this URL — PC
          LIVING is a single locked page (docs/design-tokens.md), so this
          reuses that same unmodified page rather than inventing new PC
          layout. */}
      <div className="hidden lg:block">
        <LivingHero />
        <Reveal>
          <LivingSupport />
        </Reveal>
      </div>

      {/* Mobile/tablet: visual #2, now its own page. */}
      <div className="lg:hidden">
        <LivingMobileSupport />
      </div>
    </main>
  );
}

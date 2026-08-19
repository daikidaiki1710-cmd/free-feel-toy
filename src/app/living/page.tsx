import type { Metadata } from "next";
import { LivingHero } from "@/components/living/LivingHero";
import { LivingSupport } from "@/components/living/LivingSupport";
import { LivingMobileHero } from "@/components/living/LivingMobileHero";
import { LivingMobileSupport } from "@/components/living/LivingMobileSupport";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "LIVING | Free Feel Toy",
  description: "住まい・暮らし・片付け・生活支援。暮らしの中の「ちょっと困った」を、必要な分だけお手伝い。",
};

export default function LivingPage() {
  return (
    <main>
      {/* Desktop: approved PC composition — unchanged. */}
      <div className="hidden lg:block">
        <LivingHero />
        <Reveal>
          <LivingSupport />
        </Reveal>
      </div>

      {/* Mobile/tablet: visual #1 → #2, connected directly with no added gap/decoration. */}
      <div className="lg:hidden">
        <LivingMobileHero />
        <LivingMobileSupport />
      </div>
    </main>
  );
}

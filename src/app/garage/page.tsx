import type { Metadata } from "next";
import { GarageFinal } from "@/components/garage/GarageFinal";
import { GarageFinalMobile } from "@/components/garage/GarageFinalMobile";

export const metadata: Metadata = {
  title: "GARAGE | Free Feel Toy",
  description: "配送・引越し・荷上げ・運搬相談。大切な荷物を、確実に、丁寧に。秘密基地からお届けします。",
};

export default function GaragePage() {
  return (
    <main>
      {/* Desktop: final approved single-image GARAGE (docs/design-tokens.md). */}
      <div className="hidden lg:block">
        <GarageFinal />
      </div>

      {/* Mobile/tablet: final approved single-image GARAGE, mobile crop. */}
      <div className="lg:hidden">
        <GarageFinalMobile />
      </div>
    </main>
  );
}

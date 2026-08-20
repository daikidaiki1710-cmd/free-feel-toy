import type { Metadata } from "next";
import { AboutFinal } from "@/components/about/AboutFinal";
import { AboutMobile } from "@/components/about/AboutMobile";

export const metadata: Metadata = {
  title: "ABOUT | Free Feel Toy",
  description: "Free Feel Toyとは。自由な発想を、カタチにする秘密基地。ひとつの業種に、縛られない。",
};

export default function AboutPage() {
  return (
    <main>
      {/* Desktop: final approved single-image ABOUT (docs/design-tokens.md). */}
      <div className="hidden lg:block">
        <AboutFinal />
      </div>

      {/* Mobile/tablet: final approved single-image ABOUT, mobile crop. */}
      <div className="lg:hidden">
        <AboutMobile />
      </div>
    </main>
  );
}

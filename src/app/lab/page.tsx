import type { Metadata } from "next";
import { LabFinal } from "@/components/lab/LabFinal";
import { LabFinalMobile } from "@/components/lab/LabFinalMobile";

export const metadata: Metadata = {
  title: "LAB | Free Feel Toy",
  description: "Web・アプリ・AI・デザイン・事業支援。構想を整理し、アイデアをカタチにするクリエイティブチームです。",
};

export default function LabPage() {
  return (
    <main>
      {/* Desktop: final approved single-image LAB (docs/design-tokens.md). */}
      <div className="hidden lg:block">
        <LabFinal />
      </div>

      {/* Mobile/tablet: final approved single-image LAB, mobile crop. */}
      <div className="lg:hidden">
        <LabFinalMobile />
      </div>
    </main>
  );
}

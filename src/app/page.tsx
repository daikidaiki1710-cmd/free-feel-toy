import { HomeFinal } from "@/components/home/HomeFinal";
import { HomeFinalMobile } from "@/components/home/HomeFinalMobile";

export default function Home() {
  return (
    <main>
      {/* Desktop: final approved single-image HOME (docs/design-tokens.md). */}
      <div className="hidden lg:block">
        <HomeFinal />
      </div>

      {/* Mobile/tablet: final approved single-image HOME, mobile crop. */}
      <div className="lg:hidden">
        <HomeFinalMobile />
      </div>
    </main>
  );
}

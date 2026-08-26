import { HomeFinal } from "@/components/home/HomeFinal";
import { HomeFinalMobile } from "@/components/home/HomeFinalMobile";
import { HomeOpening } from "@/components/home/HomeOpening";

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

      {/* Opening overlay — sits on top of the (unmodified) HOME above until
          dismissed, then unmounts. Never alters HomeFinal/HomeFinalMobile. */}
      <HomeOpening />
    </main>
  );
}

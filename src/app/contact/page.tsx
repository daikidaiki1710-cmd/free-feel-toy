import type { Metadata } from "next";
import { ContactFinal } from "@/components/contact/ContactFinal";
import { ContactMobileHero } from "@/components/contact/ContactMobileHero";
import { ContactMobileForm } from "@/components/contact/ContactMobileForm";
import { ContactMobileInfo } from "@/components/contact/ContactMobileInfo";

export const metadata: Metadata = {
  title: "CONTACT | Free Feel Toy",
  description: "まずは、話してみませんか。GARAGE・LAB・LIVING、どのサービスへのご相談でもお気軽にご連絡ください。",
};

export default function ContactPage() {
  return (
    <main>
      {/* Desktop: final approved single-image CONTACT (docs/design-tokens.md). */}
      <div className="hidden lg:block">
        <ContactFinal />
      </div>

      {/* Mobile/tablet: real ①②③④ sections per the approved mobile brief —
          not a shrunk copy of the PC image. */}
      <div className="lg:hidden">
        <ContactMobileHero />
        <ContactMobileForm />
        <ContactMobileInfo />
      </div>
    </main>
  );
}

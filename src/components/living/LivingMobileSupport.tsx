import Image from "next/image";

/**
 * Final approved LIVING mobile "暮らしのサポート詳細" visual #2 — a single
 * unmodified photo (docs/design-tokens.md), used as-is including its own
 * header/logo/hamburger/heading pixels (same intentional duplication as
 * the PC LivingSupport). Contact phone/LINE/QR stay display-only until an
 * official contact number is confirmed — no tel:/LINE links yet.
 *
 * The three category circles (家の中のこと / 外まわりのこと / 代行・見守り
 * のこと) get a subtle hover/tap-only ring for feedback; they are not
 * links — no destination was specified for them.
 */
export function LivingMobileSupport() {
  return (
    <section id="support" className="relative aspect-[853/1844] w-full">
      <Image
        src="/living/living-mobile-2.jpg"
        alt="LIVING. 暮らしのサポート — 家の中のこと、外まわりのこと、代行・見守りのこと。片付け・整理、家具移動・模様替え、窓拭き・簡単清掃、不用品整理、草刈り・庭まわり、玄関清掃・外まわり、買い物代行、荷物受け取り、見守り・訪問、暮らし相談。"
        fill
        sizes="100vw"
        className="object-cover object-top"
      />

      <div
        aria-hidden="true"
        className="absolute left-[20.5%] top-[21.7%] h-[9.5%] w-[19.9%] rounded-full transition-shadow duration-300 active:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[39.9%] top-[17.4%] h-[9.8%] w-[19.9%] rounded-full transition-shadow duration-300 active:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[66.2%] top-[16.5%] h-[9.5%] w-[19.9%] rounded-full transition-shadow duration-300 active:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
    </section>
  );
}

import Image from "next/image";

/**
 * Final approved "暮らしのサポート" detail section — a single unmodified
 * photo (docs/design-tokens.md), used as-is including its own header/logo/
 * nav/heading pixels (the header duplication is intentional and approved,
 * not a bug to fix by cropping). Contact phone/LINE/QR stay display-only
 * until an official contact number is confirmed — no tel:/LINE links yet.
 *
 * The three category circles (家の中のこと / 外まわりのこと / 代行・見守り
 * のこと) get a subtle hover-only ring for feedback; they are not links —
 * no destination was specified for them.
 */
export function LivingSupport() {
  return (
    <section id="support" className="relative aspect-[1054/1492] w-full">
      <Image
        src="/living/living-support.jpg"
        alt="LIVING. 暮らしのサポート — 家の中のこと、外まわりのこと、代行・見守りのこと。片付け・整理、家具移動・模様替え、窓拭き・簡単清掃、不用品整理、草刈り・庭まわり、玄関清掃・外まわり、買い物代行、荷物受け取り、見守り・訪問、暮らし相談。"
        fill
        sizes="100vw"
        className="object-cover object-top"
      />

      <div
        aria-hidden="true"
        className="absolute left-[23.2%] top-[25.1%] h-[12.7%] w-[18%] rounded-full transition-shadow duration-300 hover:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[54.1%] top-[25.1%] h-[12.7%] w-[18%] rounded-full transition-shadow duration-300 hover:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[52.7%] top-[55.3%] h-[12.7%] w-[18%] rounded-full transition-shadow duration-300 hover:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
    </section>
  );
}

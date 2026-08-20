"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Final approved ABOUT visual — a single unmodified image
 * (docs/design-tokens.md), same pattern as HOME/GARAGE/LAB/LIVING/CONTACT.
 * The image is the design; only real navigation is layered on top as
 * invisible hit areas. Desktop (1440px, source 1024x1536) only — no mobile
 * crop approved yet.
 */
export function AboutFinal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      className={`relative aspect-[1024/1536] w-full transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Image
        src="/about/about-final.jpg"
        alt="Free Feel Toy ABOUT — 夕暮れの秘密基地。Free Feel Toyとは、自由な発想をカタチにする秘密基地。"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Header nav hit areas */}
      <Link
        href="/"
        aria-label="Free Feel Toy ホームへ"
        className="absolute left-[1.5%] top-[0.5%] h-[4%] w-[11%] min-h-11 min-w-11"
      />
      <Link href="/about" aria-label="ABOUT ページへ" className="absolute left-[40%] top-[1.2%] h-[2.8%] w-[6.5%] min-h-11" />
      <Link href="/garage" aria-label="GARAGE ページへ" className="absolute left-[48%] top-[1.2%] h-[2.8%] w-[7%] min-h-11" />
      <Link href="/lab" aria-label="LAB ページへ" className="absolute left-[57.5%] top-[1.2%] h-[2.8%] w-[4.5%] min-h-11" />
      <Link href="/living" aria-label="LIVING ページへ" className="absolute left-[65%] top-[1.2%] h-[2.8%] w-[7.5%] min-h-11" />
      <Link href="/contact" aria-label="CONTACT ページへ" className="absolute left-[75.5%] top-[1.2%] h-[2.8%] w-[7.5%] min-h-11" />
      <Link
        href="/contact"
        aria-label="お問い合わせフォームへ"
        className="absolute left-[85%] top-[0.3%] h-[4.2%] w-[13.5%] min-h-11 min-w-11"
      />

      {/* 3 category tiles — heading, description, and thumbnail row are one hit area each. */}
      <Link
        href="/garage"
        aria-label="GARAGE ページへ"
        className="absolute left-[2%] top-[44%] h-[29.5%] w-[31%] transition-colors hover:bg-white/[0.04]"
      />
      <Link
        href="/lab"
        aria-label="LAB ページへ"
        className="absolute left-[35.5%] top-[44%] h-[29.5%] w-[30.5%] transition-colors hover:bg-white/[0.04]"
      />
      <Link
        href="/living"
        aria-label="LIVING ページへ"
        className="absolute left-[68%] top-[44%] h-[29.5%] w-[30%] transition-colors hover:bg-white/[0.04]"
      />

      {/* Final message CTA */}
      <Link
        href="/contact"
        aria-label="お問い合わせはこちらへ"
        className="absolute left-[4.2%] top-[84.7%] h-[2.6%] w-[29%] min-h-11 transition-colors hover:bg-white/[0.04]"
      />

      {/* Bottom bar — only the phone number is confirmed real data. */}
      <a
        href="tel:08061670414"
        aria-label="電話でお問い合わせ 080-6167-0414"
        className="absolute left-[1%] top-[91%] h-[3.5%] w-[19%] min-h-11"
      />
    </section>
  );
}

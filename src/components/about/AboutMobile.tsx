"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "ABOUT", href: "/about" },
  { label: "GARAGE", href: "/garage" },
  { label: "LAB", href: "/lab" },
  { label: "LIVING", href: "/living" },
  { label: "CONTACT", href: "/contact" },
];

const categoryLinks = [
  { label: "GARAGE", href: "/garage", top: 38, height: 10.7 },
  { label: "LAB", href: "/lab", top: 48.7, height: 10.7 },
  { label: "LIVING", href: "/living", top: 59.4, height: 10.6 },
];

/**
 * Final approved mobile ABOUT visual — a single unmodified image
 * (docs/design-tokens.md), same pattern as GARAGE/LAB/LIVING mobile. The
 * image is the design; only real navigation is layered on top as invisible
 * hit areas. Below lg only — see AboutFinal for the desktop counterpart.
 */
export function AboutMobile() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[862/1824] w-full">
      {/* unoptimized: Next's default image quality (75) visibly crushed
          shadow detail in this dark, low-key photo — serve the approved
          file's bytes as-is instead of re-compressing it. */}
      <Image
        src="/about/about-mobile.jpg"
        alt="Free Feel Toy ABOUT — 夕暮れの秘密基地。Free Feel Toyとは、自由な発想をカタチにする秘密基地。"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Header */}
      <Link
        href="/"
        aria-label="Free Feel Toy ホームへ"
        className="absolute left-[1.5%] top-[0.5%] h-[4%] w-[13%] min-h-11 min-w-11"
      />
      <Link
        href="/contact"
        aria-label="お問い合わせフォームへ"
        className="absolute left-[64.5%] top-[0.5%] h-[3.8%] w-[19%] min-h-11"
      />

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        className="absolute right-[3%] top-[1%] h-[3%] min-h-11 w-[8%] min-w-11"
      />

      {menuOpen && (
        <nav
          aria-label="メインナビゲーション"
          className="absolute right-[2%] top-[5%] z-30 w-52 rounded-lg border border-brand-brass/40 bg-brand-black-deep/95 p-4 shadow-xl backdrop-blur"
        >
          <ul className="flex flex-col gap-3 font-body text-sm tracking-widest text-brand-ivory">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block transition-colors hover:text-brand-orange"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 3 category rows — photo + heading + description + chevron, one hit area each. */}
      {categoryLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={`${item.label} ページへ`}
          className="absolute left-[2%] w-[96%] transition-colors active:bg-white/[0.04]"
          style={{ top: `${item.top}%`, height: `${item.height}%` }}
        />
      ))}

      {/* Final message CTA */}
      <Link
        href="/contact"
        aria-label="お問い合わせはこちらへ"
        className="absolute left-[1.6%] top-[83.2%] h-[2.15%] min-h-11 w-[37.2%] transition-colors active:bg-white/[0.04]"
      />

      {/* Bottom bar — only the phone number is confirmed real data. */}
      <a
        href="tel:08061670414"
        aria-label="電話でお問い合わせ 080-6167-0414"
        className="absolute left-0 top-[88.5%] h-[6.3%] w-[29%] min-h-11"
      />
    </section>
  );
}

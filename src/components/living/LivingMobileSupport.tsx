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

/**
 * Final approved LIVING mobile "暮らしのサポート詳細" visual #2 — a single
 * unmodified photo (docs/design-tokens.md), used as its own page at
 * /living/support. The container height is cropped to just above the
 * image's own baked-in phone/LINE CTA band (which duplicates the one CTA
 * kept on /living) — a display-only crop via a shorter aspect ratio and
 * object-cover object-top, not a re-export of the source file, so the
 * approved image bytes are untouched. Percentages below are relative to
 * this cropped container, not the full 853x1844 source.
 */
export function LivingMobileSupport() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[853/1665] w-full">
      <Image
        src="/living/living-mobile-2.jpg"
        alt="LIVING. 暮らしのサポート — 家の中のこと、外まわりのこと、代行・見守りのこと。片付け・整理、家具移動・模様替え、窓拭き・簡単清掃、不用品整理、草刈り・庭まわり、玄関清掃・外まわり、買い物代行、荷物受け取り、見守り・訪問、暮らし相談。"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      <Link
        href="/"
        aria-label="Free Feel Toy ホームへ"
        className="absolute left-[1.5%] top-[0.3%] h-[6.1%] min-h-11 w-[32%] min-w-11"
      />

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        className="absolute right-[5%] top-[0.9%] h-[3.9%] min-h-11 w-[9%] min-w-11"
      />

      {menuOpen && (
        <nav
          aria-label="メインナビゲーション"
          className="absolute right-[2%] top-[6%] z-30 w-52 rounded-lg border border-brand-brass/40 bg-brand-black-deep/95 p-4 shadow-xl backdrop-blur"
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

      <div
        aria-hidden="true"
        className="absolute left-[20.5%] top-[24%] h-[10.5%] w-[19.9%] rounded-full transition-shadow duration-300 active:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[39.9%] top-[19.3%] h-[10.9%] w-[19.9%] rounded-full transition-shadow duration-300 active:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-[66.2%] top-[18.3%] h-[10.5%] w-[19.9%] rounded-full transition-shadow duration-300 active:shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]"
      />
    </section>
  );
}

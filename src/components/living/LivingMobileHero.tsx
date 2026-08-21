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
 * Final approved LIVING mobile visual #1 — a single unmodified photo
 * (docs/design-tokens.md), covering hero through the CTA block in one
 * image. Not a 1:1 crop of the PC hero — it is its own complete mobile
 * composition. Below lg only; does not touch LivingHero/LivingSupport
 * (the locked PC components).
 *
 * Logo and hamburger are the only nav pixels present in this image (no
 * ABOUT/CONTACT text row, same as GARAGE's mobile photo), so only those
 * two get hit areas — ABOUT/CONTACT stay reachable through the hamburger
 * dropdown. VIEW SERVICE links to the "暮らしのサポート詳細" page
 * (/living/support, LivingMobileSupport), now a separate page rather than
 * an in-page anchor.
 */
export function LivingMobileHero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[863/1823] w-full">
      <Image
        src="/living/living-mobile-1.jpg"
        alt="Free Feel Toy LIVING — 住まい・暮らし・片付け・生活支援。自然光と植物に囲まれたリビングで暮らしを整える。"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      <Link
        href="/"
        aria-label="Free Feel Toy ホームへ"
        className="absolute left-[1.7%] top-[0.4%] h-[3.7%] min-h-11 w-[20.3%] min-w-11"
      />

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        className="absolute right-[2%] top-[0.8%] h-[2.7%] min-h-11 w-[7%] min-w-11"
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

      {/* VIEW SERVICE — links to the LIVING mobile support detail page. */}
      <Link
        href="/living/support"
        aria-label="暮らしのサポート詳細へ"
        className="absolute left-[5.2%] top-[54%] h-[1.6%] w-[31.3%] min-h-11"
      />
    </section>
  );
}

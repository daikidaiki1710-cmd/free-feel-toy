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
 * Final approved LIVING hero — a single unmodified photo
 * (docs/design-tokens.md). The image is the design; only real navigation is
 * layered on top as invisible hit areas. CLEAN UP / ORGANIZE / DIY・REFORM /
 * LIFE SUPPORT / REUSE are left purely decorative per instruction, same
 * treatment as SERVICE / WORKS / PROJECTS. PC (lg+) only for now — mobile
 * is a separate, not-yet-provided final image.
 */
export function LivingHero() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSupport = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById("support");
    if (!target) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className="relative aspect-[1536/1024] w-full">
      <Image
        src="/living/living-hero.jpg"
        alt="Free Feel Toy LIVING — 住まい・暮らし・片付け・生活支援。自然光と植物に囲まれたリビングで暮らしを整える。"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Header nav hit areas — SERVICE / WORKS / PROJECTS have no page yet
          in the confirmed sitemap (docs/project-card.md) and are left inert. */}
      <Link
        href="/"
        aria-label="Free Feel Toy ホームへ"
        className="absolute left-[1%] top-[0.8%] h-[8%] w-[14.3%] min-h-11 min-w-11"
      />
      <Link
        href="/about"
        aria-label="ABOUT ページへ"
        className="absolute left-[58.8%] top-[2.9%] h-[1.8%] min-h-11 w-[3.6%]"
      />
      <Link
        href="/contact"
        aria-label="CONTACT ページへ"
        className="absolute left-[87.1%] top-[2.9%] h-[1.8%] min-h-11 w-[5.2%]"
      />

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        className="absolute right-[1%] top-[1.5%] h-[4.9%] w-[3.3%] min-h-11 min-w-11"
      />

      {menuOpen && (
        <nav
          aria-label="メインナビゲーション"
          className="absolute right-[1%] top-[7%] z-30 w-56 rounded-lg border border-brand-brass/40 bg-brand-black-deep/95 p-4 shadow-xl backdrop-blur"
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

      {/* VIEW SERVICE — smooth-scrolls to the LIVING support detail section below. */}
      <a
        href="#support"
        onClick={scrollToSupport}
        aria-label="暮らしのサポート詳細へ"
        className="absolute left-[5.2%] top-[60.7%] h-[3.2%] w-[16.3%] min-h-11"
      />
    </section>
  );
}

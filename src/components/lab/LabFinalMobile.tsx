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
  { label: "WEB", href: "#web", left: 6.5, width: 12.3 },
  { label: "APP", href: "#app", left: 23.5, width: 12.3 },
  { label: "AI", href: "#ai", left: 40.5, width: 11.2 },
  { label: "DESIGN", href: "#design", left: 57.5, width: 14.1 },
  { label: "BUSINESS", href: "#business", left: 76.9, width: 15.8 },
];

/**
 * Final approved mobile LAB visual — a single unmodified photo
 * (docs/design-tokens.md). The image is the design, trust bar included;
 * only real navigation is layered on top as invisible hit areas. Below lg
 * only — see LabFinal for the desktop counterpart.
 */
export function LabFinalMobile() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[852/1846] w-full">
      <Image
        src="/lab/lab-final-mobile.jpg"
        alt="Free Feel Toy LAB — Web・アプリ・AI・デザイン・事業支援。ネオンサインとモニター、アイデアボードが並ぶ秘密基地の制作室。"
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
        className="absolute left-[1.8%] top-[0.5%] h-[3.3%] min-h-11 w-[20.5%] min-w-11"
      />
      <Link
        href="/about"
        aria-label="ABOUT ページへ"
        className="absolute left-[45.1%] top-[4.6%] h-[0.8%] min-h-11 w-[6.2%] min-w-11"
      />
      <Link
        href="/contact"
        aria-label="CONTACT ページへ"
        className="absolute right-[2.6%] top-[4.6%] h-[0.8%] min-h-11 w-[7.6%] min-w-11"
      />

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        className="absolute right-[2%] top-[0.8%] h-[2.4%] min-h-11 w-[5.9%] min-w-11"
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

      {/* VIEW SERVICE — anchors to a #services section not built yet. */}
      <Link
        href="#services"
        aria-label="サービス紹介へ"
        className="absolute left-[6.1%] top-[62.8%] h-[1.9%] w-[39.7%] min-h-11"
      />

      {/* 5 category anchors — sections not built yet, links prepared ahead of them. */}
      {categoryLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={`${item.label} セクションへ`}
          className="absolute top-[67.7%] h-[7.3%] min-h-11"
          style={{ left: `${item.left}%`, width: `${item.width}%` }}
        />
      ))}
    </section>
  );
}

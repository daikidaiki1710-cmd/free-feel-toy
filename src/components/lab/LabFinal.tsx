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
  { label: "WEB", href: "#web", left: 5.9, width: 4.6 },
  { label: "APP", href: "#app", left: 11.8, width: 4.4 },
  { label: "AI", href: "#ai", left: 17.6, width: 4.2 },
  { label: "DESIGN", href: "#design", left: 23.4, width: 4.6 },
  { label: "BUSINESS", href: "#business", left: 29.6, width: 5.2 },
];

/**
 * Final approved LAB visual — a single unmodified photo (docs/design-tokens.md).
 * The image is the design, trust bar included; only real navigation is
 * layered on top as invisible hit areas. Desktop (lg+) only — see
 * LabFinalMobile for the mobile counterpart.
 */
export function LabFinal() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[1536/1024] w-full">
      <Image
        src="/lab/lab-final.jpg"
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
        className="absolute left-[1%] top-[0.8%] h-[8%] w-[14.3%] min-h-11 min-w-11"
      />
      <Link
        href="/about"
        aria-label="ABOUT ページへ"
        className="absolute left-[59.1%] top-[2.9%] h-[1.8%] min-h-11 w-[4.7%]"
      />
      <Link
        href="/contact"
        aria-label="CONTACT ページへ"
        className="absolute left-[87.8%] top-[2.9%] h-[1.8%] min-h-11 w-[5%]"
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

      {/* VIEW SERVICE — anchors to a #services section not built yet. */}
      <Link
        href="#services"
        aria-label="サービス紹介へ"
        className="absolute left-[6.8%] top-[64%] h-[2.9%] w-[16%] min-h-11"
      />

      {/* 5 category anchors — sections not built yet, links prepared ahead of them. */}
      {categoryLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={`${item.label} セクションへ`}
          className="absolute top-[71.8%] h-[7.8%] min-h-11"
          style={{ left: `${item.left}%`, width: `${item.width}%` }}
        />
      ))}
    </section>
  );
}

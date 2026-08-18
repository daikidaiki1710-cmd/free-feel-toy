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
 * Row 1 (DELIVERY/MOVING/HOISTING) and row 2 (TRANSPORT/SUPPORT) are laid
 * out differently on the mobile photo than on PC — coordinates are taken
 * from the mobile crop, not scaled from the PC one.
 */
const serviceLinks = [
  { label: "DELIVERY", href: "#delivery", left: 5.2, top: 55.7, width: 29.5, height: 7.1 },
  { label: "MOVING", href: "#moving", left: 38.0, top: 55.7, width: 29.2, height: 7.1 },
  { label: "HOISTING", href: "#hoisting", left: 69.8, top: 55.7, width: 29.2, height: 7.1 },
  { label: "TRANSPORT", href: "#transport", left: 18.9, top: 64.7, width: 29.7, height: 7.2 },
  { label: "SUPPORT", href: "#support", left: 53.2, top: 64.7, width: 29.2, height: 7.2 },
];

/**
 * Final approved mobile GARAGE visual — a single unmodified photo
 * (docs/design-tokens.md). The image is the design, trust bar included;
 * only real navigation is layered on top as invisible hit areas. Below lg
 * only — see GarageFinal for the desktop counterpart.
 *
 * Unlike HOME/LAB, the mobile photo shows no ABOUT/SERVICE/WORKS/PROJECTS/
 * CONTACT text row — only the logo and hamburger. ABOUT and CONTACT are
 * still reachable through the hamburger dropdown, so no hit area is placed
 * over blank photo area for them.
 */
export function GarageFinalMobile() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[864/1821] w-full">
      <Image
        src="/garage/garage-final-mobile.jpg"
        alt="Free Feel Toy GARAGE — 配送・引越し・荷上げ・運搬相談。軽バンと段ボール、台車が並ぶ秘密基地のような作業場。"
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
        className="absolute right-[4.2%] top-[0.7%] h-[3.3%] min-h-11 w-[6.1%] min-w-11"
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
        className="absolute left-[5.2%] top-[49.6%] h-[1.8%] w-[32.4%] min-h-11"
      />

      {/* 5 service anchors — sections not built yet, links prepared ahead of them. */}
      {serviceLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={`${item.label} セクションへ`}
          className="absolute"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            width: `${item.width}%`,
            height: `${item.height}%`,
          }}
        />
      ))}
    </section>
  );
}

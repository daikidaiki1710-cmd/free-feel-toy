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
 * Final approved HOME visual — a single unmodified photo (docs/design-tokens.md).
 * The image is the design; only real navigation is layered on top as
 * invisible hit areas sized/positioned from its pixel coordinates. Desktop
 * (lg+) only — mobile keeps its own provisional build until a dedicated
 * mobile final image replaces it.
 */
export function HomeFinal() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[1536/862] w-full">
      <Image
        src="/home/home-final.jpg"
        alt="Free Feel Toy — 自由な発想を、カタチに。GARAGE・LAB・LIVINGの3つの部屋が横に並ぶ、秘密基地のようなオフィスビジュアル。"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Header nav hit areas — SERVICE / WORKS / PROJECTS have no page yet
          in the confirmed sitemap (docs/project-card.md) and are left inert. */}
      <Link
        href="/about"
        aria-label="ABOUT ページへ"
        className="absolute left-[60.2%] top-[2.9%] h-[3.1%] w-[4.6%]"
      />
      <Link
        href="/contact"
        aria-label="CONTACT ページへ"
        className="absolute left-[87.9%] top-[2.9%] h-[3.1%] w-[5%]"
      />

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        className="absolute right-[1%] top-[0.9%] h-[7.2%] w-[3.1%] min-h-11 min-w-11"
      />

      {menuOpen && (
        <nav
          aria-label="メインナビゲーション"
          className="absolute right-[1%] top-[10%] z-30 w-56 rounded-lg border border-brand-brass/40 bg-brand-black-deep/95 p-4 shadow-xl backdrop-blur"
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

      {/* Room ENTER hit areas — the whole doorway is clickable, a superset of the ENTER link itself. */}
      <Link
        href="/garage"
        aria-label="GARAGE（配送・引越し・荷上げ・運搬相談）ページへ"
        className="absolute left-0 top-[45.8%] h-[54.2%] w-[31.25%]"
      />
      <Link
        href="/lab"
        aria-label="LAB（Web・アプリ・AI・デザイン・事業支援）ページへ"
        className="absolute left-[31.25%] top-[45.8%] h-[54.2%] w-[32.87%]"
      />
      <Link
        href="/living"
        aria-label="LIVING（暮らしのサポート）ページへ"
        className="absolute left-[64.12%] top-[45.8%] h-[54.2%] w-[35.88%]"
      />
    </section>
  );
}

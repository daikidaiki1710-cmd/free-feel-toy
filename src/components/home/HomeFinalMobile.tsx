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
 * Final approved mobile HOME visual — a single unmodified photo
 * (docs/design-tokens.md). The image is the design; only real navigation is
 * layered on top as invisible hit areas sized/positioned from its pixel
 * coordinates. Below lg only — see HomeFinal for the desktop counterpart.
 */
export function HomeFinalMobile() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative aspect-[852/1685] w-full">
      <Image
        src="/home/home-final-mobile.jpg"
        alt="Free Feel Toy — 自由な発想を、カタチに。GARAGE・LAB・LIVINGの3つの部屋が縦に並ぶ、秘密基地のようなオフィスビジュアル。"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Header nav. ABOUT/CONTACT stay as pure hit areas over the baked
          labels (unchanged). SERVICE/WORKS/PROJECTS are covered with a
          same-color patch (the header background is solid near-black) and
          relabeled with real text reading GARAGE/LAB/LIVING, matching the
          site's official structure — no new image has been approved yet,
          so the source pixels themselves are untouched. */}
      <Link
        href="/about"
        aria-label="ABOUT ページへ"
        className="absolute left-[46.4%] top-[1.7%] h-[1%] min-h-11 w-[6.5%] min-w-11"
      />
      <Link
        href="/garage"
        aria-label="GARAGE ページへ"
        className="absolute left-[55%] top-[1.2%] h-[2.5%] min-h-11 w-[9%] min-w-11"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[55%] top-[1.75%] flex h-[1.1%] w-[9.6%] items-center justify-center bg-black font-body text-[1.35vw] font-bold tracking-[0.1em] text-white"
      >
        GARAGE
      </span>
      <Link
        href="/lab"
        aria-label="LAB ページへ"
        className="absolute left-[64.5%] top-[1.2%] h-[2.5%] min-h-11 w-[7.8%] min-w-11"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[64.5%] top-[1.75%] flex h-[1.1%] w-[8.1%] items-center justify-center bg-black font-body text-[1.35vw] font-bold tracking-[0.1em] text-white"
      >
        LAB
      </span>
      <Link
        href="/living"
        aria-label="LIVING ページへ"
        className="absolute left-[72.5%] top-[1.2%] h-[2.5%] min-h-11 w-[9.5%] min-w-11"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[72.5%] top-[1.75%] flex h-[1.1%] w-[9.5%] items-center justify-center bg-black font-body text-[1.35vw] font-bold tracking-[0.1em] text-white"
      >
        LIVING
      </span>
      <Link
        href="/contact"
        aria-label="CONTACT ページへ"
        className="absolute left-[82.2%] top-[1.7%] h-[1%] min-h-11 w-[6.8%] min-w-11"
      />

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        className="absolute right-[2%] top-[0.6%] h-[2.8%] min-h-11 w-[5.9%] min-w-11"
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

      {/* Room ENTER hit areas — the whole doorway is clickable, a superset of the ENTER link itself. */}
      <Link
        href="/garage"
        aria-label="GARAGE（配送・引越し・荷上げ・運搬相談）ページへ"
        className="absolute left-0 top-[23.9%] h-[23.7%] w-full"
      />
      <Link
        href="/lab"
        aria-label="LAB（Web・アプリ・AI・デザイン・事業支援）ページへ"
        className="absolute left-0 top-[47.7%] h-[25.2%] w-full"
      />
      <Link
        href="/living"
        aria-label="LIVING（暮らしのサポート）ページへ"
        className="absolute left-0 top-[72.9%] h-[27.1%] w-full"
      />
    </section>
  );
}

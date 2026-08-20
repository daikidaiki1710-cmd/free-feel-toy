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
 * CONTACT mobile ①ヒーロービジュアル + ②メッセージエリア. The approved PC
 * CONTACT (docs/design-tokens.md) is a single locked image with the CONTACT
 * heading/copy baked into its pixels, so there is no clean mobile crop that
 * carries that text without also carrying the PC-only header row and being
 * cropped in a way that abandons the portrait phone-shape brief. This uses
 * a text-free crop of the same approved photo — the hanging lamps and
 * "FREE FEEL TOY." shelf signage just below the PC header row — as an
 * establishing first-view shot, then real HTML for the CONTACT heading and
 * copy below it — same words as the PC image, same black/ivory/green world.
 */
export function ContactMobileHero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative bg-brand-black-deep">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src="/contact/contact-mobile-hero.jpg"
          alt="Free Feel Toy CONTACT — 秘密基地のようなワークショップ。ぶら下がる電球と「FREE FEEL TOY. GARAGE LAB LIVING」の看板、道具棚。"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-black-deep/85 to-transparent"
        />

        <Link
          href="/"
          aria-label="Free Feel Toy ホームへ"
          className="absolute left-3 top-2 flex min-h-11 flex-col justify-center leading-none"
        >
          <span className="font-heading text-2xl text-brand-ivory">FFT</span>
          <span className="font-script text-xs text-brand-ivory-muted">Free Feel Toy.</span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-brand-ivory"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {menuOpen && (
          <nav
            aria-label="メインナビゲーション"
            className="absolute right-2 top-14 z-30 w-48 rounded-lg border border-[#7f9862]/40 bg-brand-black-deep/95 p-4 shadow-xl backdrop-blur"
          >
            <ul className="flex flex-col gap-3 font-body text-sm tracking-widest text-brand-ivory">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block transition-colors hover:text-[#7f9862]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className="flex flex-col gap-4 px-6 py-8">
        <h1 className="font-heading text-5xl leading-none text-brand-ivory">CONTACT</h1>
        <p className="font-body text-lg font-bold text-[#7f9862]">まずは、話してみませんか。</p>
        <div className="font-body text-sm leading-relaxed text-brand-ivory/90">
          <p>「こんなこと頼める？」くらいのご相談から大歓迎。</p>
          <p>
            Free Feel Toyが、あなたの「ちょっと困った」「こんなの欲しい」を一緒に考えます。
          </p>
          <p>どのサービスへのご相談でも、お気軽にご連絡ください。</p>
        </div>
      </div>
    </section>
  );
}

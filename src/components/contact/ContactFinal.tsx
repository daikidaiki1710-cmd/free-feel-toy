"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

type CategoryId = "garage" | "lab" | "living" | "other";

const categories: { id: CategoryId; label: string; domain?: "garage" | "lab" | "living" }[] = [
  { id: "garage", label: "GARAGE", domain: "garage" },
  { id: "lab", label: "LAB", domain: "lab" },
  { id: "living", label: "LIVING", domain: "living" },
  { id: "other", label: "OTHER" },
];

const footerNav = [
  { label: "ABOUT", href: "/about", left: 32, width: 7 },
  { label: "GARAGE", href: "/garage", left: 39.5, width: 7.5 },
  { label: "LAB", href: "/lab", left: 50, width: 6 },
  { label: "LIVING", href: "/living", left: 58, width: 8 },
  { label: "CONTACT", href: "/contact", left: 67.5, width: 10 },
];

/**
 * Final approved CONTACT visual — a single unmodified photo/mock
 * (docs/design-tokens.md), same pattern as GARAGE/LAB/LIVING. The image is
 * the design, form included; only real navigation + a working form are
 * layered on top. Desktop (1536x1024) only — see ContactMobileHero for the
 * mobile counterpart.
 */
type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function ContactFinal() {
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();
  const companyId = useId();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          category: formData.get("category"),
          message: formData.get("message"),
          company: formData.get("company"),
        }),
      });

      if (!response.ok) throw new Error("send_failed");

      form.reset();
      setCategory(null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative aspect-[1536/1024] w-full bg-black">
      <Image
        src="/contact/contact-final.jpg"
        alt="Free Feel Toy CONTACT — 夕暮れの秘密基地。外から見たガレージの入口、暖かい光が漏れる「FREE FEEL TOY.」の看板。お問い合わせフォーム。"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Header nav hit areas */}
      <Link
        href="/"
        aria-label="Free Feel Toy ホームへ"
        className="absolute left-[0.5%] top-[0.5%] h-[8%] w-[12.5%] min-h-11 min-w-11"
      />
      <Link href="/about" aria-label="ABOUT ページへ" className="absolute left-[27.5%] top-[2.3%] h-[3.3%] w-[6%] min-h-11" />
      <Link href="/garage" aria-label="GARAGE ページへ" className="absolute left-[36.3%] top-[2.3%] h-[3.3%] w-[7.2%] min-h-11" />
      <Link href="/lab" aria-label="LAB ページへ" className="absolute left-[46.5%] top-[2.3%] h-[3.3%] w-[4%] min-h-11" />
      <Link href="/living" aria-label="LIVING ページへ" className="absolute left-[55.2%] top-[2.3%] h-[3.3%] w-[6%] min-h-11" />
      <Link href="/contact" aria-label="CONTACT ページへ" className="absolute left-[63.3%] top-[2.3%] h-[4%] w-[6.2%] min-h-11" />
      <Link
        href="/contact"
        aria-label="お問い合わせフォームへ"
        className="absolute left-[86.3%] top-[0.5%] h-[8%] w-[12%] min-h-11 min-w-11"
      />

      {/* Contact form — real inputs positioned over the approved form panel. */}
      <form onSubmit={handleSubmit} className="contents">
        {/* Honeypot — invisible to real users (off-screen, unfocusable,
            unannounced), so it stays unfilled by humans and filled by bots.
            Not sr-only: a honeypot must be hidden from screen readers too. */}
        <div className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
          <label htmlFor={companyId}>会社名</label>
          <input id={companyId} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <label htmlFor={nameId} className="sr-only">
          お名前
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          placeholder=" "
          aria-label="お名前"
          className="absolute left-[55.8%] top-[22.9%] h-[4.7%] w-[19.8%] rounded-md border border-transparent bg-transparent px-[1%] font-body text-[1vw] text-brand-black-deep outline-none placeholder:text-transparent focus:border-brand-black-deep/25 focus:bg-white/60 not-placeholder-shown:border-brand-black-deep/20 not-placeholder-shown:bg-white/95"
        />

        <label htmlFor={emailId} className="sr-only">
          メールアドレス
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          placeholder=" "
          aria-label="メールアドレス"
          className="absolute left-[78.4%] top-[22.9%] h-[4.7%] w-[19.3%] rounded-md border border-transparent bg-transparent px-[1%] font-body text-[1vw] text-brand-black-deep outline-none placeholder:text-transparent focus:border-brand-black-deep/25 focus:bg-white/60 not-placeholder-shown:border-brand-black-deep/20 not-placeholder-shown:bg-white/95"
        />

        <label htmlFor={phoneId} className="sr-only">
          電話番号
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          placeholder=" "
          aria-label="電話番号"
          className="absolute left-[55.8%] top-[31.7%] h-[4.8%] w-[19.8%] rounded-md border border-transparent bg-transparent px-[1%] font-body text-[1vw] text-brand-black-deep outline-none placeholder:text-transparent focus:border-brand-black-deep/25 focus:bg-white/60 not-placeholder-shown:border-brand-black-deep/20 not-placeholder-shown:bg-white/95"
        />

        <fieldset className="contents">
          <legend className="sr-only">何について相談しますか？</legend>
          {categories.map((item, index) => {
            const left = [55.8, 66.6, 77.45, 88.5][index];
            const width = [9.7, 9.7, 9.9, 9.4][index];
            return (
              <label
                key={item.id}
                data-domain={item.domain}
                className="absolute top-[41.9%] h-[7.5%] cursor-pointer rounded-lg border-2 border-transparent has-[:checked]:border-theme-accent"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <input
                  type="radio"
                  name="category"
                  value={item.id}
                  required
                  checked={category === item.id}
                  onChange={() => setCategory(item.id)}
                  className="sr-only"
                  aria-label={item.label}
                />
              </label>
            );
          })}
        </fieldset>

        <label htmlFor={messageId} className="sr-only">
          お問い合わせ内容
        </label>
        <textarea
          id={messageId}
          name="message"
          placeholder=" "
          aria-label="お問い合わせ内容"
          className="absolute left-[55.8%] top-[56.2%] h-[10.9%] w-[42.1%] resize-none rounded-md border border-transparent bg-transparent px-[1%] py-[0.5%] font-body text-[1vw] text-brand-black-deep outline-none placeholder:text-transparent focus:border-brand-black-deep/25 focus:bg-white/60 not-placeholder-shown:border-brand-black-deep/20 not-placeholder-shown:bg-white/95"
        />

        <button
          type="submit"
          disabled={status === "submitting"}
          aria-label={status === "submitting" ? "送信中" : "送信する"}
          className="absolute left-[55.8%] top-[68.4%] h-[4.1%] w-[42.1%] min-h-11 disabled:cursor-wait"
        />
        {status === "submitting" ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-[55.8%] top-[68.4%] flex h-[4.1%] w-[42.1%] items-center justify-center rounded-md bg-brand-black-deep/85 font-body text-[0.9vw] font-bold text-brand-ivory"
          >
            送信中...
          </span>
        ) : null}

        {status === "success" ? (
          <p
            role="status"
            className="absolute left-[55.8%] top-[73%] w-[42.1%] rounded-md bg-brand-ivory/95 px-[1%] py-[0.6%] font-body text-[0.8vw] text-brand-black-deep/80 shadow"
          >
            お問い合わせありがとうございます。内容を確認後、ご連絡いたします。
          </p>
        ) : status === "error" ? (
          <p
            role="status"
            className="absolute left-[55.8%] top-[73%] w-[42.1%] rounded-md bg-brand-ivory/95 px-[1%] py-[0.6%] font-body text-[0.8vw] text-red-700 shadow"
          >
            送信に失敗しました。お手数ですがLINEまたはお電話でお問い合わせください。
          </p>
        ) : null}
      </form>

      {/* Bottom bar — phone, LINE, and email are confirmed real data. */}
      <a
        href="tel:08061670414"
        aria-label="電話でお問い合わせ 080-6167-0414"
        className="absolute left-[8%] top-[81.5%] h-[8%] w-[18%] min-h-11"
      />

      {/* LINE — the baked heading/icon stay as-is. This whole block sits on
          a solid backing panel sized to fully cover the baked "LINEでの
          ご相談も受け付けております。/ お気軽にメッセージをお送りください。"
          copy underneath (the source image never had ID/URL/QR baked in,
          so those two lines would otherwise show through). ID is a plain
          text overlay, the button is the one real link, and the QR is a
          plain scannable image. */}
      <div className="absolute left-[32%] top-[83.3%] flex w-[18%] flex-col items-start gap-1.5 rounded bg-brand-black-deep p-2">
        <span className="font-body text-[0.85vw] text-brand-ivory">ID: @546hnsfs</span>
        <div className="flex items-center gap-3">
          <a
            href="https://lin.ee/ZLB1YII"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded-full bg-[#7f9862] px-4 font-body text-[0.75vw] font-bold text-white transition-colors hover:bg-[#6f8654]"
          >
            LINEで相談する
          </a>
          <span className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded bg-white p-1.5">
            <span className="relative block h-full w-full">
              <Image src="/contact/line-qr.png" alt="LINE公式アカウントQRコード" fill sizes="72px" className="object-contain" />
            </span>
          </span>
        </div>
      </div>

      {/* Email — same treatment; the baked address is replaced by a real
          overlay showing the confirmed address. */}
      <a
        href="mailto:freefeeltoy.freefeeltoy6677@gmail.com"
        aria-label="メールで問い合わせる freefeeltoy.freefeeltoy6677@gmail.com"
        className="absolute left-[51%] top-[81.3%] h-[8%] w-[24.5%]"
      >
        <span className="absolute left-[17%] top-[30%] w-[83%] rounded bg-brand-black-deep px-[3%] py-[3%] font-body text-[0.75vw] leading-snug text-brand-ivory">
          freefeeltoy.freefeeltoy6677@gmail.com
        </span>
      </a>

      {/* Footer nav row */}
      <Link
        href="/"
        aria-label="Free Feel Toy ホームへ"
        className="absolute left-[2.5%] top-[95.7%] h-[4%] w-[11%] min-h-11"
      />
      {footerNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={`${item.label} ページへ`}
          className="absolute top-[95.7%] h-[4%] min-h-11"
          style={{ left: `${item.left}%`, width: `${item.width}%` }}
        />
      ))}
    </section>
  );
}

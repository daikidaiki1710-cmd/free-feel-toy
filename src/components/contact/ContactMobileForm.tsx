"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";

type CategoryId = "garage" | "lab" | "living" | "other";

type Category = {
  id: CategoryId;
  label: string;
  hint: string;
  icon: ReactNode;
};

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

const categories: Category[] = [
  {
    id: "garage",
    label: "GARAGE",
    hint: "運ぶ・届ける",
    icon: (
      <svg {...iconProps} width="26" height="26">
        <path d="M3 16V9l3-4h7l3 4h5v7" />
        <path d="M3 16h1M21 16h-1" />
        <rect x="14" y="9" width="7" height="7" />
        <circle cx="7.5" cy="17.5" r="1.7" />
        <circle cx="17.5" cy="17.5" r="1.7" />
      </svg>
    ),
  },
  {
    id: "lab",
    label: "LAB",
    hint: "つくる・考える",
    icon: (
      <svg {...iconProps} width="26" height="26">
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5A3 3 0 0 1 15.6 13.8 6 6 0 0 0 12 3Z" />
      </svg>
    ),
  },
  {
    id: "living",
    label: "LIVING",
    hint: "暮らしを支える",
    icon: (
      <svg {...iconProps} width="26" height="26">
        <path d="M4 11 12 4l8 7" />
        <path d="M6 10v9h12v-9" />
        <path d="M10 19v-5h4v5" />
      </svg>
    ),
  },
  {
    id: "other",
    label: "OTHER",
    hint: "その他・ご相談",
    icon: (
      <svg {...iconProps} width="26" height="26">
        <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 4.2A7.96 7.96 0 0 1 21 12Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

/**
 * CONTACT mobile ③お問い合わせフォーム — same real, unwired-to-any-backend
 * form as the PC version (no send destination confirmed yet), laid out as
 * one column with a 2x2 category grid per the approved mobile brief.
 */
type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function ContactMobileForm() {
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
    <section className="bg-brand-ivory px-6 py-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Honeypot — invisible to real users (off-screen, unfocusable,
            unannounced), so it stays unfilled by humans and filled by bots.
            Not sr-only: a honeypot must be hidden from screen readers too. */}
        <div className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
          <label htmlFor={companyId}>会社名</label>
          <input id={companyId} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex items-center gap-3 border-b border-brand-black-deep/15 pb-4">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="text-brand-black-deep">
            <rect x="5" y="3" width="14" height="18" rx="1.5" />
            <path d="M9 3v2h6V3M8 9h8M8 13h8M8 17h5" />
          </svg>
          <h2 className="font-heading text-xl tracking-wide text-brand-black-deep">お問い合わせフォーム</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className="font-body text-sm font-semibold text-brand-black-deep">
            お名前 <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] text-white">必須</span>
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            required
            placeholder="例）山田 太郎"
            className="min-h-11 rounded-md border border-brand-black-deep/15 bg-white px-4 py-3 font-body text-sm text-brand-black-deep placeholder:text-brand-black-deep/40 focus:border-[#7f9862] focus:outline-none focus:ring-2 focus:ring-[#7f9862]/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={emailId} className="font-body text-sm font-semibold text-brand-black-deep">
            メールアドレス <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] text-white">必須</span>
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            placeholder="例）example@mail.com"
            className="min-h-11 rounded-md border border-brand-black-deep/15 bg-white px-4 py-3 font-body text-sm text-brand-black-deep placeholder:text-brand-black-deep/40 focus:border-[#7f9862] focus:outline-none focus:ring-2 focus:ring-[#7f9862]/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={phoneId} className="font-body text-sm font-semibold text-brand-black-deep">
            電話番号（任意）
          </label>
          <input
            id={phoneId}
            name="phone"
            type="tel"
            placeholder="例）080-6167-0414"
            className="min-h-11 rounded-md border border-brand-black-deep/15 bg-white px-4 py-3 font-body text-sm text-brand-black-deep placeholder:text-brand-black-deep/40 focus:border-[#7f9862] focus:outline-none focus:ring-2 focus:ring-[#7f9862]/30"
          />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-body text-sm font-semibold text-brand-black-deep">
            何について相談しますか？ <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] text-white">必須</span>
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((item) => {
              const isSelected = category === item.id;
              return (
                <label
                  key={item.id}
                  className={`flex min-h-11 cursor-pointer flex-col items-center gap-2 rounded-lg border px-3 py-4 text-center transition-colors ${
                    isSelected
                      ? "border-[#7f9862] bg-[#7f9862]/10"
                      : "border-brand-black-deep/15 bg-white hover:border-brand-black-deep/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={item.id}
                    required
                    checked={isSelected}
                    onChange={() => setCategory(item.id)}
                    className="sr-only"
                  />
                  <span className={isSelected ? "text-[#7f9862]" : "text-brand-black-deep"}>{item.icon}</span>
                  <span className="font-heading text-sm tracking-wide text-brand-black-deep">{item.label}</span>
                  <span className="font-body text-[11px] text-brand-black-deep/60">{item.hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor={messageId} className="font-body text-sm font-semibold text-brand-black-deep">
            お問い合わせ内容（任意）
          </label>
          <textarea
            id={messageId}
            name="message"
            rows={4}
            placeholder="ご相談内容をご自由にご記入ください"
            className="resize-none rounded-md border border-brand-black-deep/15 bg-white px-4 py-3 font-body text-sm text-brand-black-deep placeholder:text-brand-black-deep/40 focus:border-[#7f9862] focus:outline-none focus:ring-2 focus:ring-[#7f9862]/30"
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#7f9862] px-6 py-4 font-heading text-base tracking-wide text-white transition-colors hover:bg-[#6f8654] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? (
            "送信中..."
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
              </svg>
              送信する
            </>
          )}
        </button>

        {status === "success" ? (
          <p role="status" className="font-body text-sm text-brand-black-deep/70">
            お問い合わせありがとうございます。内容を確認後、ご連絡いたします。
          </p>
        ) : status === "error" ? (
          <p role="status" className="font-body text-sm text-red-700">
            送信に失敗しました。お手数ですがLINEまたはお電話でお問い合わせください。
          </p>
        ) : (
          <p className="font-body text-xs text-brand-black-deep/50">※通常、24時間以内にご返信いたします。</p>
        )}
      </form>
    </section>
  );
}

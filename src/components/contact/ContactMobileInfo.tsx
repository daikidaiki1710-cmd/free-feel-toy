import Image from "next/image";

/**
 * CONTACT mobile ④問い合わせ情報. Phone (080-6167-0414), LINE
 * (@546hnsfs / https://lin.ee/ZLB1YII) and email
 * (freefeeltoy.freefeeltoy6677@gmail.com) are confirmed and wired as real
 * links. Hours / service area remain the same display-only values already
 * shown on the approved PC image.
 */
export function ContactMobileInfo() {
  return (
    <section className="flex flex-col gap-8 bg-brand-black-deep px-6 py-10">
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7f9862]">
          <path d="M4 5c0 8.284 6.716 15 15 15l2-4-6-2-1.5 2A13 13 0 0 1 6.5 8.5L8.5 7 6.5 1 2.5 3C2.5 3.7 4 4.3 4 5Z" />
        </svg>
        <div>
          <p className="font-body text-xs tracking-widest text-[#7f9862]">お電話でのお問い合わせ</p>
          <a href="tel:08061670414" className="inline-block min-h-11 py-1 font-heading text-xl text-brand-ivory transition-colors hover:text-[#7f9862]">
            080-6167-0414
          </a>
          <p className="mt-1 font-body text-xs text-brand-ivory-muted">受付時間 8:00〜20:00（年中無休）</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7f9862] text-[10px] font-bold text-brand-black-deep" aria-hidden="true">
          LINE
        </span>
        <div className="flex flex-1 items-center gap-4">
          <div className="flex flex-col items-start gap-2">
            <div>
              <p className="font-body text-xs tracking-widest text-[#7f9862]">LINEでのお問い合わせ</p>
              <p className="font-body text-sm text-brand-ivory">ID: @546hnsfs</p>
            </div>
            <a
              href="https://lin.ee/ZLB1YII"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#7f9862] px-5 font-body text-sm font-bold text-white transition-colors hover:bg-[#6f8654]"
            >
              LINEで相談する
            </a>
          </div>
          <Image
            src="/contact/line-qr.png"
            alt="LINE公式アカウントQRコード"
            width={88}
            height={88}
            className="ml-auto shrink-0 rounded bg-white p-1.5"
          />
        </div>
      </div>

      <a href="mailto:freefeeltoy.freefeeltoy6677@gmail.com" className="flex items-start gap-3 rounded-md transition-colors hover:bg-white/[0.04]">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7f9862]">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="m4 6.5 8 6.5 8-6.5" />
        </svg>
        <div>
          <p className="font-body text-xs tracking-widest text-[#7f9862]">メールでのお問い合わせ</p>
          <p className="font-body text-sm text-brand-ivory break-all">freefeeltoy.freefeeltoy6677@gmail.com</p>
          <p className="mt-1 font-body text-xs text-brand-ivory-muted">24時間受付中／返信は営業時間内に行います</p>
        </div>
      </a>

      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="mt-0.5 shrink-0 text-[#7f9862]">
          <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
        <div>
          <p className="font-body text-xs tracking-widest text-[#7f9862]">対応エリア</p>
          <p className="font-body text-sm text-brand-ivory">愛知県全域・岐阜県・三重県</p>
          <p className="mt-1 font-body text-xs text-brand-ivory-muted">その他エリアもご相談ください。</p>
        </div>
      </div>
    </section>
  );
}

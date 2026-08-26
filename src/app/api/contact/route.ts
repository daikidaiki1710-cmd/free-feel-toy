import { NextResponse } from "next/server";
import { Resend } from "resend";

const RECIPIENT = "freefeeltoy.freefeeltoy6677@gmail.com";

// Resend's shared sandbox sender — works without verifying a custom domain.
// Swap for a verified domain address (e.g. contact@freefeeltoy.jp) once one
// is set up in the Resend dashboard, for better deliverability/branding.
const SENDER = "Free Feel Toy <onboarding@resend.dev>";

const CATEGORY_LABELS: Record<string, string> = {
  garage: "GARAGE",
  lab: "LAB",
  living: "LIVING",
  other: "OTHER",
};

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  category?: unknown;
  message?: unknown;
  company?: unknown; // honeypot — real visitors never fill this in
};

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Honeypot tripped — report success without sending so bots can't tell.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !category) {
    return NextResponse.json({ error: "missing_required_fields" }, { status: 400 });
  }
  if (!Object.hasOwn(CATEGORY_LABELS, category)) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const submittedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: SENDER,
      to: RECIPIENT,
      replyTo: email,
      subject: "【Free Feel Toy】ホームページからお問い合わせ",
      text: [
        `お名前: ${name}`,
        `メールアドレス: ${email}`,
        `電話番号: ${phone || "未入力"}`,
        `お問い合わせカテゴリ: ${CATEGORY_LABELS[category]}`,
        `お問い合わせ内容: ${message || "未入力"}`,
        `送信日時: ${submittedAt}`,
      ].join("\n"),
    });
    if (error) {
      console.error("Resend send failed", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (error) {
    console.error("Resend send failed", error);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

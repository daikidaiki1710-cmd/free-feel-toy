import type { Metadata } from "next";
import { Anton, Noto_Sans_JP, Permanent_Marker } from "next/font/google";
import "./globals.css";

const heading = Anton({
  variable: "--font-heading-anton",
  weight: "400",
  subsets: ["latin"],
});

const script = Permanent_Marker({
  variable: "--font-script-marker",
  weight: "400",
  subsets: ["latin"],
});

const body = Noto_Sans_JP({
  variable: "--font-body-noto",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free Feel Toy",
  description: "自由な発想。自由な想像。Free Feel Toy 公式サイト。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${heading.variable} ${script.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-theme-bg-deep font-body text-theme-text-heading">
        {children}
      </body>
    </html>
  );
}

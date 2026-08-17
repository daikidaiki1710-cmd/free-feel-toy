import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";

const navItems = [
  { label: "ABOUT", href: "/about" },
  { label: "GARAGE", href: "/garage" },
  { label: "LAB", href: "/lab" },
  { label: "LIVING", href: "/living" },
  { label: "CONTACT", href: "/contact" },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
      <Link href="/" className="flex flex-col leading-none">
        <Logo className="text-xl text-theme-text-heading sm:text-2xl" />
        <span className="mt-1 font-body text-[10px] tracking-[0.25em] text-theme-text-heading/70 sm:text-xs">
          自由な発想を、カタチに。
        </span>
      </Link>

      <nav
        aria-label="メインナビゲーション"
        className="hidden items-center gap-8 font-body text-sm tracking-widest text-theme-text-heading/90 md:flex"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition-colors hover:text-theme-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <MobileNav items={navItems} />
    </header>
  );
}

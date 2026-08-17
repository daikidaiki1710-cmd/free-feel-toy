import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "children">;

export function CtaLink({ href, children, className, ...props }: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={`group/cta inline-flex items-center gap-2 font-body text-sm font-semibold tracking-[0.2em] text-theme-accent transition-colors hover:text-theme-text-heading ${className ?? ""}`}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="transition-transform group-hover/cta:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

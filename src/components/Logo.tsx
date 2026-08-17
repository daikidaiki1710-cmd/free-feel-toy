type LogoProps = {
  className?: string;
};

/**
 * Text-based placeholder for the official wordmark (SVG not yet confirmed —
 * docs/project-card.md F-7). Swapping in the real SVG later should not
 * require changes at call sites: keep the same component name and props.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span className={`font-script leading-none ${className ?? ""}`}>
      Free Feel Toy
      <span className="text-theme-accent">.</span>
    </span>
  );
}

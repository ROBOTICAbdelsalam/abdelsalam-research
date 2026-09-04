import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-4">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-balance">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base md:text-lg text-muted leading-relaxed text-balance">
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs tracking-wide",
        tone === "default" && "border-border text-muted",
        tone === "accent" && "border-accent/30 bg-accent-soft text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}

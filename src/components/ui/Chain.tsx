import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Chain({
  items,
  separator = "arrow",
  direction = "horizontal",
  className,
  lastItemAccent = false,
}: {
  items: string[];
  separator?: "arrow" | "plus";
  direction?: "horizontal" | "vertical";
  className?: string;
  lastItemAccent?: boolean;
}) {
  const Separator = separator === "arrow" ? ArrowRight : Plus;

  if (direction === "vertical") {
    return (
      <div className={cn("relative pl-7", className)}>
        <div className="absolute left-[3.5px] top-2 bottom-2 w-px bg-border" aria-hidden />
        <div className="flex flex-col gap-7">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const tone = isLast && lastItemAccent ? "var(--accent)" : "var(--trace)";
            return (
              <div key={item} className="relative">
                <span
                  className="absolute -left-8 top-0 h-4 w-4 rounded-full motion-safe:animate-node-pulse"
                  style={{ backgroundColor: tone, animationDelay: `${index * 0.3}s` }}
                  aria-hidden
                />
                <span
                  className="absolute -left-7 top-1.5 h-2 w-2 rounded-full ring-4 ring-background"
                  style={{ backgroundColor: tone }}
                  aria-hidden
                />
                <span
                  className={cn(
                    "font-display text-lg sm:text-xl tracking-tight",
                    isLast && lastItemAccent ? "text-accent" : "text-foreground"
                  )}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-xs uppercase tracking-wide",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item} className="flex items-center gap-2">
            <span className={lastItemAccent && isLast ? "text-accent" : "text-foreground"}>
              {item}
            </span>
            {!isLast && <Separator size={12} className="text-accent shrink-0" aria-hidden />}
          </span>
        );
      })}
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * Visual marker for content that has not been provided yet (e.g. missing
 * publications, degrees, or a CV file). Makes it obvious to both visitors
 * and the site owner that a section is a placeholder, not real content.
 */
export function Placeholder({
  children,
  className,
  editPath,
}: {
  children: React.ReactNode;
  className?: string;
  editPath?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border-strong bg-transparent p-6 text-sm text-muted",
        className
      )}
    >
      <p className="leading-relaxed">{children}</p>
      {editPath ? (
        <p className="mt-3 font-mono text-xs text-muted/70">
          Edit in <code className="text-accent">{editPath}</code>
        </p>
      ) : null}
    </div>
  );
}

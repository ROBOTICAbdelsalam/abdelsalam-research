import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]";

const variants = {
  primary: "bg-foreground text-background hover:bg-accent hover:text-accent-foreground",
  outline: "border border-border-strong text-foreground hover:border-accent hover:text-accent",
  ghost: "text-muted hover:text-foreground",
};

type ButtonProps = {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & ComponentPropsWithoutRef<"button">)
);

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (props.href) {
    const { href, ...rest } = props as { href: string };
    const isExternal = /^https?:\/\//.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          {...(rest as ComponentPropsWithoutRef<"a">)}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}

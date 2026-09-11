"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { navigation, siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getScrolled() {
  return window.scrollY > 8;
}

function getScrolledServer() {
  return false;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getScrolledServer);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/85 backdrop-blur transition-[border-color,box-shadow] duration-300",
        scrolled ? "border-border-strong shadow-[0_1px_0_0_var(--border)]" : "border-border"
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between transition-[height] duration-300",
          scrolled ? "h-14" : "h-16"
        )}
      >
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          {siteConfig.name}
          <span className="ml-2 font-mono text-xs font-normal text-accent align-middle">
            .ai
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            if (item.href === "/cv") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "ml-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-accent text-accent"
                      : "border-border-strong text-foreground hover:border-accent hover:text-accent"
                  )}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-accent" : "text-muted hover:text-foreground"
                )}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute left-1/2 -bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full motion-safe:animate-pulse-slow"
                    style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </Container>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="lg:hidden border-t border-border bg-background">
          <Container className="flex flex-col py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-foreground border-b border-border last:border-none"
              >
                {item.label}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}

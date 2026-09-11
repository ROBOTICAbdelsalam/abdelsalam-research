import Link from "next/link";
import { GraduationCap, FileText, Mail, Phone } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";

const footerNav = [
  { label: "Research", href: "/research" },
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "Events", href: "/events" },
  { label: "CV", href: "/cv" },
];

const socials = [
  { label: siteConfig.email, href: `mailto:${siteConfig.email}`, icon: Mail },
  { label: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s+/g, "")}`, icon: Phone },
  { label: "GitHub", href: siteConfig.links.github, icon: GithubIcon },
  { label: "Google Scholar", href: siteConfig.links.googleScholar, icon: GraduationCap },
  { label: "ORCID", href: siteConfig.links.orcid, icon: FileText },
  { label: "LinkedIn", href: siteConfig.links.linkedin, icon: LinkedinIcon },
].filter((item) => item.href && item.href !== "mailto:" && item.href !== "tel:");

export function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <Container className="py-14 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-muted">
            {siteConfig.title} · Researcher
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted/70">
            Building intelligent systems across AI, robotics, industrial
            automation and brain-computer interfaces.
          </p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-3">
              Navigate
            </p>
            <ul className="space-y-2">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-3">
              Connect
            </p>
            <ul className="space-y-2">
              {socials.map((item) => {
                const isExternal = item.href.startsWith("http");
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      <item.icon size={14} className="shrink-0" aria-hidden />
                      <span className="break-all">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>

      <Container className="border-t border-border py-6">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

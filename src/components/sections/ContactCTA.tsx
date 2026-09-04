import type { ComponentType } from "react";
import { Mail, Phone, GraduationCap, FileText, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { siteConfig } from "@/data/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const focus = [
  "Research collaboration",
  "Robotics & automation roles",
  "AI / Robotics projects",
  "Technical collaboration",
];

const githubUsername = siteConfig.links.github.replace(/^https?:\/\/(www\.)?github\.com\//, "");

const links: {
  label: string;
  sublabel?: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}[] = [
  { label: siteConfig.email, href: `mailto:${siteConfig.email}`, icon: Mail },
  { label: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s+/g, "")}`, icon: Phone },
  { label: "GitHub", sublabel: githubUsername, href: siteConfig.links.github, icon: GithubIcon },
  { label: "LinkedIn", href: siteConfig.links.linkedin, icon: LinkedinIcon },
  { label: "Google Scholar", href: siteConfig.links.googleScholar, icon: GraduationCap },
  { label: "ORCID", href: siteConfig.links.orcid, icon: FileText },
].filter((item) => item.href);

export function ContactCTA({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal>
        {showHeading ? (
          <>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-balance">
              Let&apos;s build intelligent systems.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Open to research collaboration, robotics and automation roles,
              AI and robotics projects, and technical consulting.
            </p>
          </>
        ) : null}
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
          <MapPin size={14} aria-hidden />
          {siteConfig.location}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {focus.map((item) => (
            <li
              key={item}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button href={`mailto:${siteConfig.email}`}>Get in touch</Button>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-2xl border border-border bg-surface p-2">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center justify-between gap-4 rounded-xl px-5 py-4 transition-colors hover:bg-background"
            >
              <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-foreground">
                <item.icon size={16} className="shrink-0 text-accent" aria-hidden />
                <span className="min-w-0">
                  <span className="block break-all">{item.label}</span>
                  {item.sublabel && (
                    <span className="block break-all font-mono text-xs font-normal text-muted">
                      {item.sublabel}
                    </span>
                  )}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs text-muted">↗</span>
            </a>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

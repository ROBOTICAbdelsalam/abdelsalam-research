import { ArrowRight, Download, GraduationCap, FileText, CalendarDays, Cpu } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { HeroVisual } from "./HeroVisual";
import { HeroCircuitEdge } from "./HeroCircuitEdge";
import { siteConfig, heroCredentials } from "@/data/site";

const socials = [
  { label: "GitHub", href: siteConfig.links.github, icon: GithubIcon },
  { label: "Google Scholar", href: siteConfig.links.googleScholar, icon: GraduationCap },
  { label: "ORCID", href: siteConfig.links.orcid, icon: FileText },
  { label: "LinkedIn", href: siteConfig.links.linkedin, icon: LinkedinIcon },
].filter((item) => item.href);

const credentialIcons = [CalendarDays, GraduationCap, GraduationCap, Cpu];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden lg:block opacity-60">
        <HeroCircuitEdge />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden lg:block opacity-60">
        <HeroCircuitEdge flip />
      </div>
      <Container className="relative py-20 md:py-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div>
            <Reveal>
              <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase mb-6">
                {siteConfig.positioning}
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              {/* Hero-only display name — deliberately distinct from
                  siteConfig.name (used in the header, footer and page
                  metadata), which stays unchanged. */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-balance">
                ABD ELSALAM
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-4 text-lg sm:text-xl text-trace font-mono uppercase tracking-wide">
                {siteConfig.title}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-8 max-w-xl text-lg sm:text-xl leading-snug text-foreground/80 text-balance">
                {siteConfig.heroLead}
              </p>
              <p className="mt-1 max-w-xl font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-balance">
                {siteConfig.heroFocus}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted text-balance">
                {siteConfig.heroSupporting}
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href="/projects">
                  Explore My Work
                  <ArrowRight size={16} aria-hidden />
                </Button>
                <Button href="/cv" variant="outline">
                  Download CV
                  <Download size={16} aria-hidden />
                </Button>
              </div>
            </Reveal>

            {socials.length > 0 && (
              <Reveal delay={0.3}>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {socials.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      <item.icon size={15} aria-hidden />
                      {item.label}
                    </a>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.15} className="lg:pl-6">
            <HeroVisual />
          </Reveal>
        </div>

        <Reveal delay={0.35} className="mt-20 md:mt-24">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {heroCredentials.map((item, index) => {
              const Icon = credentialIcons[index];
              return (
                <div key={item.value} className="flex items-start gap-4 bg-surface p-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
                    <Icon size={16} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <p className="font-display text-xl font-medium tracking-tight">
                      {item.value}
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-muted">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted/70">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

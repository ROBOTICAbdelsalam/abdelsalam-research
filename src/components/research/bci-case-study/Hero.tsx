import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GithubIcon } from "@/components/icons/BrandIcons";
import { THESIS_META, REPO_LINKS } from "@/data/bci-thesis";

// 01 HERO — replaces the generic PageHeader for this one project: the
// brief calls for three real buttons (a generic PageHeader has none), so
// this is a bespoke hero rather than a reuse of that shared component.
export function Hero() {
  return (
    <section className="border-b border-border bg-grid">
      <Container className="py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-5">
            {THESIS_META.degree} · {THESIS_META.institution}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-balance">
            {THESIS_META.title}
          </h1>
          <p className="mt-2 font-display text-xl sm:text-2xl text-muted tracking-tight text-balance">
            {THESIS_META.subtitle}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-balance">
            {THESIS_META.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {THESIS_META.metadataTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="#system-pipeline">Explore System</Button>
            <Button href={REPO_LINKS.repository} variant="outline">
              <GithubIcon size={16} aria-hidden /> View GitHub
            </Button>
            <Button href="#ros2-architecture" variant="ghost">
              Architecture
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

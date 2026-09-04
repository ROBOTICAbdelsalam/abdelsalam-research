import { Container } from "./Container";
import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-border bg-grid">
      <Container className="py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-5">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-balance max-w-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted text-balance">
              {subtitle}
            </p>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}

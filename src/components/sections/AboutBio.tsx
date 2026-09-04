import {
  aboutIntro,
  careerTrajectory,
  engineeringInterests,
  languages,
  researchInterests,
} from "@/data/about";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Chain } from "@/components/ui/Chain";

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-trace" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function AboutBio() {
  return (
    <div className="flex flex-col gap-16">
      <Reveal className="max-w-2xl">
        <p className="text-xl sm:text-2xl leading-relaxed text-balance">
          {aboutIntro.positioning}
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted">{aboutIntro.bio}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {languages.map((lang) => (
            <span
              key={lang.name}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted"
            >
              {lang.name} · {lang.level}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
          Professional Trajectory
        </p>
        <Chain items={careerTrajectory} direction="vertical" lastItemAccent />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Reveal>
          <ListCard title="What I Research" items={researchInterests} />
        </Reveal>
        <Reveal delay={0.05}>
          <ListCard title="What I Build" items={engineeringInterests} />
        </Reveal>
      </div>
    </div>
  );
}

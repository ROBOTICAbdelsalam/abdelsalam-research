import { FlaskConical } from "lucide-react";
import { publicationCategories, publications } from "@/data/publications";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

const totalPublications = Object.values(publications).reduce(
  (sum, list) => sum + list.length,
  0
);

export function PublicationsList() {
  if (totalPublications === 0) {
    return (
      <Reveal>
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
            <FlaskConical size={20} />
          </span>
          <h3 className="font-display text-xl font-medium">Research in Progress</h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            No publications have been released yet. This page will list
            journal papers, conference papers, preprints, thesis work and
            technical reports as they are completed — nothing here is
            fabricated in the meantime.
          </p>
        </Card>
      </Reveal>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {publicationCategories.map((category) => {
        const items = publications[category];
        if (items.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {category}
            </h3>
            <div className="mt-5 flex flex-col gap-4">
              {items.map((pub) => (
                <Reveal key={pub.title}>
                  <Card>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h4 className="font-display text-lg font-medium tracking-tight text-balance">
                        {pub.title}
                      </h4>
                      <span className="font-mono text-xs text-muted shrink-0">
                        {pub.year}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{pub.authors}</p>
                    <p className="mt-1 text-sm text-accent">{pub.venue}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {pub.abstract}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs">
                      {pub.doi ? (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-accent"
                        >
                          DOI
                        </a>
                      ) : null}
                      {pub.paperUrl ? (
                        <a
                          href={pub.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-accent"
                        >
                          Paper
                        </a>
                      ) : null}
                      {pub.codeUrl ? (
                        <a
                          href={pub.codeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-accent"
                        >
                          Code
                        </a>
                      ) : null}
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

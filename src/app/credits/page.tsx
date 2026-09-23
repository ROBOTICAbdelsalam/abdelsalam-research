import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "3D Asset Credits",
  description:
    "Attribution for the third-party 3D models used in the site's interactive 3D scenes.",
};

const BY_LICENSE = {
  name: "CC BY 3.0",
  url: "https://creativecommons.org/licenses/by/3.0/",
};

// Every external 3D asset used across the site's 3D scenes. Keep in sync
// with public/models/CREDITS.md. The BCI digital twin no longer loads any
// 3D models of its own — its scene is a layered WebGL reconstruction of a
// single source photograph, not procedural geometry or GLB props — so
// both assets below are credited for their Hero-scene use only.
const attributedAssets = [
  {
    title: "male_base",
    role: "Human head and shoulders bust — the Hero's Human–Machine Interaction node",
    creator: "hedy magroun",
    sourceUrl: "https://poly.pizza/m/eqJEiOX0Fhl",
    changes:
      "Removed the eyeball mesh, stripped materials and textures, welded and compressed the mesh. Restyled as dark glass with an EEG-style mesh overlay.",
  },
  {
    title: "Brain",
    role: "Anatomical brain — the Hero's AI / ML node hologram",
    creator: "J-Toastie",
    sourceUrl: "https://poly.pizza/m/YihDCHsOPO",
    changes: "Stripped materials, recomputed smooth normals, compressed the mesh. Rendered as a blue hologram with a wireframe overlay.",
  },
];

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-accent underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

export default function CreditsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Credits"
        title="3D Asset Credits"
        subtitle="Third-party models appear in one place: the interactive scene on the home page. Everything else there is original, procedurally generated geometry — as is the Hybrid-Adaptive BCI project's digital twin, whose own scene is built from its own commissioned photograph rather than any 3D model."
      />

      <section className="py-20 md:py-24">
        <Container className="max-w-3xl">
          <ul className="space-y-6">
            {attributedAssets.map((asset) => (
              <li key={asset.title}>
                <Card>
                  <h2 className="font-display text-xl font-medium tracking-tight">{asset.title}</h2>
                  <p className="mt-1 text-sm text-muted">{asset.role}</p>

                  <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-[8rem_1fr]">
                    <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">Creator</dt>
                    <dd>{asset.creator}</dd>

                    <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">Source</dt>
                    <dd>
                      <ExternalLink href={asset.sourceUrl}>{asset.sourceUrl}</ExternalLink>
                    </dd>

                    <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">License</dt>
                    <dd>
                      <ExternalLink href={BY_LICENSE.url}>{BY_LICENSE.name}</ExternalLink>{" "}
                      <span className="text-muted">— Creative Commons Attribution 3.0 Unported</span>
                    </dd>

                    <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted">Changes</dt>
                    <dd className="text-muted">{asset.changes}</dd>
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

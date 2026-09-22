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

const CC0_LICENSE = {
  name: "CC0 1.0",
  url: "https://polyhaven.com/license",
};

// Every external 3D asset used across the site's 3D scenes. Keep in sync
// with public/models/CREDITS.md and, for the BCI twin, src/data/bci-assets.ts.
const attributedAssets = [
  {
    title: "male_base",
    role: "Human head and shoulders bust — the Hero's Human–Machine Interaction node, and the BCI digital twin's seated EEG participant",
    creator: "hedy magroun",
    sourceUrl: "https://poly.pizza/m/eqJEiOX0Fhl",
    changes:
      "Removed the eyeball mesh, stripped materials and textures, welded and compressed the mesh. Restyled twice: dark glass with an EEG-style mesh overlay on the home page; a clothed, physically lit seated participant with a procedural EEG cap on the BCI project page.",
  },
  {
    title: "Brain",
    role: "Anatomical brain — the Hero's AI / ML node hologram, and the BCI digital twin's central visualization core",
    creator: "J-Toastie",
    sourceUrl: "https://poly.pizza/m/YihDCHsOPO",
    changes:
      "Stripped materials, recomputed smooth normals, compressed the mesh. Restyled twice: a blue hologram with a wireframe overlay on the home page; a grounded glass-and-emissive installation on the BCI project page.",
  },
];

// Poly Haven's full catalogue is CC0 — public domain, no attribution
// legally required — used only by the BCI digital twin's laboratory scene.
// Listed here anyway for transparency.
const cc0Assets = [
  { title: "Metal Office Desk", role: "Workstation desks", creator: "Ulan Cabanilla", sourceUrl: "https://polyhaven.com/a/metal_office_desk" },
  { title: "Metal Stool 02", role: "Workstation seating", creator: "Ulan Cabanilla", sourceUrl: "https://polyhaven.com/a/metal_stool_02" },
  { title: "Steel Frame Shelves 02", role: "Equipment racks", creator: "James Ray Cock", sourceUrl: "https://polyhaven.com/a/steel_frame_shelves_02" },
  { title: "Wall Clock", role: "Wall detail", creator: "PierreB3D", sourceUrl: "https://polyhaven.com/a/wall_clock" },
  { title: "Power Box 01", role: "Power/breaker panel", creator: "Rico Cilliers, Yann Kervran", sourceUrl: "https://polyhaven.com/a/power_box_01" },
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
        subtitle="Third-party models appear in two places: the interactive scene on the home page, and the Hybrid-Adaptive BCI project's digital twin. Everything else in both scenes is original, procedurally generated geometry."
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

          <h2 className="mt-14 font-display text-lg font-medium tracking-tight">
            Laboratory props (BCI digital twin only)
          </h2>
          <p className="mt-2 text-sm text-muted">
            Five models from{" "}
            <ExternalLink href="https://polyhaven.com">Poly Haven</ExternalLink>, whose full catalogue is{" "}
            <ExternalLink href={CC0_LICENSE.url}>{CC0_LICENSE.name}</ExternalLink> (public domain — no
            attribution legally required; listed here anyway for transparency).
          </p>
          <ul className="mt-6 space-y-3">
            {cc0Assets.map((asset) => (
              <li key={asset.title} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3 text-sm">
                <span>
                  <span className="font-medium">{asset.title}</span>{" "}
                  <span className="text-muted">— {asset.role}</span>
                </span>
                <span className="text-muted">
                  {asset.creator} · <ExternalLink href={asset.sourceUrl}>source</ExternalLink>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

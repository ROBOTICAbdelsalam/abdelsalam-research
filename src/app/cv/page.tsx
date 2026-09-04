import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { Download, Eye, FileExclamationPoint } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "CV",
  description: "Download the curriculum vitae.",
};

export default function CvPage() {
  const cvFilePath = path.join(process.cwd(), "public", siteConfig.cvPath);
  const cvExists = existsSync(cvFilePath);

  return (
    <>
      <PageHeader
        eyebrow="Curriculum Vitae"
        title="CV"
        subtitle={`${siteConfig.fullName} — ${siteConfig.title}`}
      />

      <section className="py-24 md:py-28">
        <Container className="max-w-2xl">
          <Reveal>
            {cvExists ? (
              <div className="flex flex-wrap gap-4">
                <Button href={siteConfig.cvPath} download>
                  Download CV (PDF)
                  <Download size={16} aria-hidden />
                </Button>
                <Button href={siteConfig.cvPath} variant="outline" target="_blank">
                  View CV
                  <Eye size={16} aria-hidden />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-6 rounded-2xl border border-dashed border-border-strong p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-muted">
                  <FileExclamationPoint size={18} />
                </span>
                <div>
                  <p className="font-display text-lg font-medium">
                    CV not uploaded yet
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    A CV has not been added to this site yet. Once ready, add
                    the file at the path below and this page will
                    automatically show a working download button.
                  </p>
                </div>
                <Placeholder>
                  Add your PDF at{" "}
                  <code className="text-accent">public{siteConfig.cvPath}</code>.
                </Placeholder>
              </div>
            )}
          </Reveal>
        </Container>
      </section>
    </>
  );
}

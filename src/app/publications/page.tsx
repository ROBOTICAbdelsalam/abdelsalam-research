import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PublicationsList } from "@/components/sections/PublicationsList";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Academic publications — journal papers, conference papers, preprints, thesis work and technical reports.",
};

export default function PublicationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Publications"
        title="Academic Record"
        subtitle="Journal papers, conference papers, preprints, thesis work and technical reports."
      />

      <section className="py-20 md:py-24">
        <Container className="max-w-3xl">
          <PublicationsList />
        </Container>
      </section>
    </>
  );
}

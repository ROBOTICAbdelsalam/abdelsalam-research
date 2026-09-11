import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventsGrid } from "@/components/events/EventsGrid";
import { eventsIntro } from "@/data/events";

export const metadata: Metadata = {
  title: eventsIntro.title,
  description: eventsIntro.subtitle,
};

export default function EventsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Events"
        title={eventsIntro.title}
        subtitle={eventsIntro.subtitle}
      />

      <section className="py-20 md:py-24">
        <Container>
          <EventsGrid />
        </Container>
      </section>
    </>
  );
}

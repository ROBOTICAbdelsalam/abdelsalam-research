import { ArrowRight } from "lucide-react";
import { events } from "@/data/events";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EventCard } from "@/components/events/EventCard";

// Renders nothing until real event data exists in src/data/events.ts —
// the homepage must never show an empty Events placeholder.
export function LatestActivity() {
  if (events.length === 0) return null;

  const latest = [...events].sort((a, b) => b.year - a.year).slice(0, 2);

  return (
    <section className="pt-20 pb-24 border-t border-border md:pt-24 md:pb-32">
      <Container>
        <SectionHeading
          eyebrow="07 — Latest Activity"
          title="Events & Professional Activity"
          subtitle="Recent conferences, workshops and professional engagements."
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {latest.map((event, index) => (
            <EventCard key={event.slug} event={event} delay={index * 0.05} />
          ))}
        </div>
        <div className="mt-10">
          <Button href="/events" variant="outline">
            View all events
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>
      </Container>
    </section>
  );
}

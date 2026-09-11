import { CalendarDays } from "lucide-react";
import { events } from "@/data/events";
import { EventCard } from "./EventCard";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

export function EventsGrid() {
  if (events.length === 0) {
    return (
      <Reveal>
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
            <CalendarDays size={20} />
          </span>
          <h3 className="font-display text-xl font-medium">No Events Listed Yet</h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Conferences, workshops, seminars and professional activities will
            be listed here as they&apos;re confirmed — nothing here is
            fabricated in the meantime.
          </p>
        </Card>
      </Reveal>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {events.map((event, index) => (
        <EventCard key={event.slug} event={event} delay={index * 0.05} />
      ))}
    </div>
  );
}

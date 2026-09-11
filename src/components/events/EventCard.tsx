import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import type { EventItem } from "@/data/events";
import { Reveal } from "@/components/ui/Reveal";

export function EventCard({ event, delay = 0 }: { event: EventItem; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:border-accent/40 hover:-translate-y-0.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
            {event.type}
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
            {event.status}
          </span>
        </div>

        <h3 className="mt-4 font-display text-xl font-medium tracking-tight">
          {event.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} aria-hidden />
            {event.date}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} aria-hidden />
              {event.location}
            </span>
          ) : null}
        </div>

        {event.organization ? (
          <p className="mt-1 text-sm text-muted">{event.organization}</p>
        ) : null}

        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
          {event.description}
        </p>

        {event.topics && event.topics.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {event.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : null}

        {event.officialUrl ? (
          <div className="mt-6 border-t border-border pt-5">
            <a
              href={event.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Official event page
              <ExternalLink size={14} aria-hidden />
            </a>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}

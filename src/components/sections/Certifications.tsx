import { Award } from "lucide-react";
import { certifications } from "@/data/certifications";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

export function Certifications() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {certifications.map((cert, index) => (
        <Reveal key={cert.title} delay={index * 0.05} className="h-full">
          <Card className="flex h-full flex-col">
            <Award className="h-5 w-5 text-accent" aria-hidden />
            <h3 className="mt-4 font-display text-base font-medium leading-snug text-foreground">
              {cert.title}
            </h3>
            <p className="mt-2 text-sm text-muted flex-1">{cert.issuer}</p>
            <p className="mt-3 font-mono text-xs text-muted/70">{cert.date}</p>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}

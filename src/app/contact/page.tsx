import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SignalAccent } from "@/components/ui/SignalAccent";
import { ContactCTA } from "@/components/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch for research collaboration, robotics and automation roles, AI/Robotics projects, and technical consulting.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's build intelligent systems."
        subtitle="Open to research collaboration, robotics and automation roles, AI/Robotics projects and technical consulting."
      />

      <section className="py-20 md:py-24">
        <Container>
          <SignalAccent className="mb-14" />
          <ContactCTA showHeading={false} />
        </Container>
      </section>
    </>
  );
}

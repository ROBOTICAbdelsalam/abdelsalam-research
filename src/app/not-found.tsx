import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-grid">
      <Container className="py-24 text-center">
        <p className="font-mono text-sm text-accent tracking-[0.2em]">404</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl font-medium tracking-tight">
          Page not found
        </h1>
        <p className="mt-4 text-muted max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/">
            <ArrowLeft size={16} aria-hidden />
            Back to home
          </Button>
        </div>
      </Container>
    </section>
  );
}

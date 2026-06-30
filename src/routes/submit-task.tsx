import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/submit-task")({
  head: () => ({
    meta: [
      { title: "Submit a Task — Sign in to NDH" },
      { name: "description", content: "Submit a Task is part of the NDH Client Dashboard. Sign in or create an account to brief us." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubmitTaskGate,
});

function SubmitTaskGate() {
  return (
    <SiteLayout>
      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto w-full max-w-2xl px-6 text-center">
          <Reveal>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 backdrop-blur">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">Submit a Task lives in your Client Dashboard.</h1>
            <p className="mt-4 text-white/80">
              Create a free NDH account (or sign in) and you'll land straight on the task brief wizard with full project history, messaging and invoices.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup"><Button variant="brand" size="xl">Create account <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/login"><Button variant="hero" size="xl">Sign in</Button></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
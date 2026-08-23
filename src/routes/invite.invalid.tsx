import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/invite/invalid")({
  component: InvalidPage,
});

function InvalidPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-6 py-16">
        <Card className="p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Invitation invalid or expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">PM, Talent and Director invitations are single-use and expire in 7 days. Please contact Super Admin for a new invite link.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/contact"><Button variant="outline">Contact support</Button></Link>
            <Link to="/"><Button variant="brand">Go home</Button></Link>
          </div>
        </Card>
      </div>
    </SiteLayout>
  );
}

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { submitSupportTicket } from "@/lib/support.functions";
import { toast } from "sonner";

export function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const send = useServerFn(submitSupportTicket);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.length < 2 || !/\S+@\S+\.\S+/.test(form.email) || form.message.length < 5) {
      toast.error("Please fill in name, a valid email, and a message.");
      return;
    }
    setSending(true);
    try {
      await send({ data: { name: form.name, email: form.email, subject: form.subject || null, message: form.message } });
      setDone(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {open && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-border bg-card shadow-elegant animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Chat with NDH</div>
              <div className="text-xs text-muted-foreground">We reply within a few hours.</div>
            </div>
            <button aria-label="Close contact widget" onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          {done ? (
            <div className="p-6 text-center">
              <div className="text-base font-semibold">Message received.</div>
              <p className="mt-1 text-sm text-muted-foreground">Our team will email you back shortly.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setDone(false); setOpen(false); }}>Done</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3 p-4">
              <div>
                <Label htmlFor="cw-name" className="text-xs">Name</Label>
                <Input id="cw-name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="cw-email" className="text-xs">Email</Label>
                <Input id="cw-email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="cw-subject" className="text-xs">Subject <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="cw-subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="cw-message" className="text-xs">Message</Label>
                <Textarea id="cw-message" rows={4} required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
              </div>
              <Button type="submit" disabled={sending} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>
      )}
      <button
        aria-label={open ? "Close contact widget" : "Open contact widget"}
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white shadow-glow transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { respondToTask, submitWork } from "@/lib/talent/talent.functions";
import { Loader2, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { TaskChat } from "@/components/dashboard/client/TaskChat";
import type { TalentTask } from "./types";

export function TaskDetailsDialog({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { user } = useAuth();
  const [task, setTask] = useState<TalentTask | null>(null);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const respond = useServerFn(respondToTask);
  const submit = useServerFn(submitWork);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_talent_tasks");
      const t = (data as TalentTask[] | null)?.find((x) => x.id === taskId) || null;
      setTask(t);
    })();
  }, [taskId]);

  const download = async (path: string) => {
    const { data } = await supabase.storage.from("task-files").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const accept = async (accept: boolean) => {
    if (!task) return;
    setBusy(true);
    try { await (respond as any)({ data: { taskId: task.id, accept } }); toast.success(accept ? "Task accepted" : "Task declined"); onClose(); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const upload = async () => {
    if (!user || !task || files.length === 0) { toast.error("Attach at least one deliverable"); return; }
    setBusy(true);
    try {
      const out: { name: string; path: string }[] = [];
      for (const f of files) {
        const path = `${user.id}/${task.id}/deliverable-${Date.now()}-${f.name}`;
        const { error } = await supabase.storage.from("task-files").upload(path, f);
        if (error) throw error;
        out.push({ name: f.name, path });
      }
      await (submit as any)({ data: { taskId: task.id, deliverables: out, notes } });
      toast.success("Work submitted for QA");
      onClose();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{task?.title || "Task"}</DialogTitle></DialogHeader>
        {!task ? (
          <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="brief">
            <TabsList>
              <TabsTrigger value="brief">Brief</TabsTrigger>
              <TabsTrigger value="submit">Submit work</TabsTrigger>
              <TabsTrigger value="chat">Chat with PM</TabsTrigger>
            </TabsList>
            <TabsContent value="brief" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-secondary p-4 text-sm sm:grid-cols-4">
                <div><div className="text-[10px] uppercase text-muted-foreground">Category</div><div className="font-semibold capitalize">{task.service_category}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Tier</div><div className="font-semibold capitalize">{task.tier}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Deadline</div><div className="font-semibold">{task.deadline || "Flexible"}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Your pay</div><div className="font-extrabold">₦{(task.talent_pay_rate || 0).toLocaleString()}</div></div>
              </div>
              <div>
                <h3 className="text-sm font-bold">Description</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{task.description || "—"}</p>
              </div>
              {task.revision_notes && task.status === "revision_required" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <div className="font-bold">Revision notes from PM</div>
                  <p className="mt-1 whitespace-pre-wrap">{task.revision_notes}</p>
                </div>
              )}
              {task.files && task.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold">Reference files</h3>
                  <ul className="mt-2 space-y-1">
                    {task.files.map((f) => (
                      <li key={f.path}><button onClick={() => download(f.path)} className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-xs"><FileText className="h-3 w-3" /> {f.name}</button></li>
                    ))}
                  </ul>
                </div>
              )}
              {task.talent_response === "pending" && (
                <div className="flex gap-2 border-t border-border pt-4">
                  <Button variant="brand" disabled={busy} onClick={() => accept(true)}>Accept task</Button>
                  <Button variant="outline" disabled={busy} onClick={() => accept(false)}>Decline</Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="submit" className="space-y-3">
              {task.talent_response !== "accepted" && task.status !== "revision_required" ? (
                <p className="text-sm text-muted-foreground">Accept the task first to submit work.</p>
              ) : (
                <>
                  <label className="block">
                    <span className="text-sm font-medium">Deliverables</span>
                    <div className="mt-2 flex flex-col gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm">
                      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold">
                        <Upload className="h-3 w-3" /> Add files
                        <input type="file" multiple className="hidden" onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files || [])])} />
                      </label>
                      {files.map((f, i) => (
                        <span key={i} className="inline-flex w-fit items-center gap-1 rounded-md bg-background px-2 py-1 text-xs">
                          {f.name} <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Notes to PM (optional)</span>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  </label>
                  <Button variant="brand" disabled={busy || files.length === 0} onClick={upload}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for QA"}
                  </Button>
                </>
              )}
            </TabsContent>
            <TabsContent value="chat"><TaskChat taskId={task.id} pmId={task.assigned_pm_id} /></TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
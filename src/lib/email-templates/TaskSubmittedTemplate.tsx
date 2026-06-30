import * as React from "react";
import { BrandedLayout, H1, P, CTA, InfoCard } from "./BrandedLayout";

export function TaskSubmittedTemplate(props: {
  clientName?: string;
  taskTitle: string;
  category: string;
  tier: string;
  pmName?: string | null;
  taskUrl?: string;
}) {
  const url = props.taskUrl || "https://ndh.com.ng/dashboard/client?tab=tasks";
  return (
    <BrandedLayout preview={`Your task "${props.taskTitle}" has been received.`}>
      <H1>Your task has been received</H1>
      <P>Hi {props.clientName || "there"}, thanks for trusting NDH with your project. Here's a quick summary:</P>
      <InfoCard rows={[
        { k: "Task", v: props.taskTitle },
        { k: "Department", v: props.category },
        { k: "Tier", v: props.tier },
        { k: "Assigned PM", v: props.pmName || "Being assigned…" },
        { k: "Expected response", v: "Within 4 business hours" },
      ]} />
      <P>Your PM will review your brief and send a quote shortly. You'll be notified by email.</P>
      <CTA href={url} label="View task" />
    </BrandedLayout>
  );
}

export default TaskSubmittedTemplate;
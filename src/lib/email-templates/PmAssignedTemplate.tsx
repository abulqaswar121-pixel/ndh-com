import * as React from "react";
import { BrandedLayout, H1, P, CTA, InfoCard } from "./BrandedLayout";

export function PmAssignedTemplate(props: {
  pmName?: string;
  taskTitle: string;
  category: string;
  tier: string;
  clientName: string;
  budgetRange?: string;
  deadline?: string;
  taskUrl?: string;
}) {
  const url = props.taskUrl || "https://ndh.com.ng/dashboard/pm";
  return (
    <BrandedLayout preview={`New task assigned: ${props.taskTitle}`}>
      <H1>New task assigned to you</H1>
      <P>Hi {props.pmName || "PM"}, a new task has been routed to your department.</P>
      <InfoCard rows={[
        { k: "Task", v: props.taskTitle },
        { k: "Client", v: props.clientName },
        { k: "Department", v: props.category },
        { k: "Tier", v: props.tier },
        { k: "Budget range", v: props.budgetRange || "—" },
        { k: "Deadline", v: props.deadline || "Flexible" },
      ]} />
      <P>Please review the brief and send a quote to the client.</P>
      <CTA href={url} label="Open task" />
    </BrandedLayout>
  );
}

export default PmAssignedTemplate;
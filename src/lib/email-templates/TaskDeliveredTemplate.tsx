import * as React from "react";
import { BrandedLayout, H1, P, CTA, InfoCard } from "./BrandedLayout";

export function TaskDeliveredTemplate(props: {
  clientName?: string;
  taskTitle: string;
  pmName?: string;
  taskUrl?: string;
}) {
  const url = props.taskUrl || "https://ndh.com.ng/dashboard/client?tab=tasks";
  return (
    <BrandedLayout preview={`Your task "${props.taskTitle}" is ready for review`}>
      <H1>Your task is ready 🎉</H1>
      <P>Hi {props.clientName || "there"}, your task has been delivered. Please review the deliverables and either approve or request a revision.</P>
      <InfoCard rows={[
        { k: "Task", v: props.taskTitle },
        { k: "Delivered by", v: props.pmName || "Your PM" },
      ]} />
      <CTA href={url} label="Review deliverables" />
    </BrandedLayout>
  );
}

export default TaskDeliveredTemplate;
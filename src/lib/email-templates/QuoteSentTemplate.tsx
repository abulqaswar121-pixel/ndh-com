import * as React from "react";
import { BrandedLayout, H1, P, CTA, InfoCard } from "./BrandedLayout";

export function QuoteSentTemplate(props: {
  clientName?: string;
  taskTitle: string;
  amount: string;
  notes?: string;
  taskUrl?: string;
}) {
  const url = props.taskUrl || "https://ndh.com.ng/dashboard/client?tab=tasks";
  return (
    <BrandedLayout preview={`Quote ready for ${props.taskTitle}`}>
      <H1>Your quote is ready</H1>
      <P>Hi {props.clientName || "there"}, your PM has prepared a quote for "{props.taskTitle}".</P>
      <InfoCard rows={[
        { k: "Task", v: props.taskTitle },
        { k: "Quote", v: <strong>{props.amount}</strong> },
        ...(props.notes ? [{ k: "Notes", v: props.notes }] : []),
      ]} />
      <CTA href={url} label="Approve or reject quote" />
    </BrandedLayout>
  );
}

export default QuoteSentTemplate;
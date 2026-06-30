import * as React from "react";
import { BrandedLayout, H1, P, CTA, InfoCard } from "./BrandedLayout";

export function PaymentReceivedTemplate(props: {
  clientName?: string;
  taskTitle: string;
  amount: string;
  reference: string;
  taskUrl?: string;
}) {
  const url = props.taskUrl || "https://ndh.com.ng/dashboard/client?tab=tasks";
  return (
    <BrandedLayout preview={`Payment confirmed for ${props.taskTitle}`}>
      <H1>Payment confirmed — work is starting ✅</H1>
      <P>Hi {props.clientName || "there"}, we've received your payment. Your PM has been notified and work begins immediately.</P>
      <InfoCard rows={[
        { k: "Task", v: props.taskTitle },
        { k: "Amount", v: <strong>{props.amount}</strong> },
        { k: "Reference", v: props.reference },
        { k: "Status", v: "In progress" },
      ]} />
      <CTA href={url} label="Track progress" />
    </BrandedLayout>
  );
}

export default PaymentReceivedTemplate;
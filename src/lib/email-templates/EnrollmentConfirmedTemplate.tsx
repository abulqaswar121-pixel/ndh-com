import * as React from "react";
import { BrandedLayout, H1, P, CTA, InfoCard } from "./BrandedLayout";

export function EnrollmentConfirmedTemplate(props: {
  studentName?: string;
  programName: string;
  programType: string;
  duration?: string;
  amount: string;
  reference: string;
  dashboardUrl?: string;
}) {
  const url = props.dashboardUrl || "https://ndh.com.ng/dashboard/student";
  return (
    <BrandedLayout preview={`You're enrolled in ${props.programName}`}>
      <H1>Welcome to NDH Academy 🎓</H1>
      <P>Hi {props.studentName || "there"}, your enrolment is confirmed. Your learning portal and course materials are now unlocked.</P>
      <InfoCard rows={[
        { k: "Program", v: <strong>{props.programName}</strong> },
        { k: "Type", v: props.programType },
        ...(props.duration ? [{ k: "Duration", v: props.duration }] : []),
        { k: "Tuition paid", v: props.amount },
        { k: "Reference", v: props.reference },
      ]} />
      <P>Sign in to your student dashboard to start Module 1. Your instructor will reach out within 24 hours.</P>
      <CTA href={url} label="Go to my learning portal" />
    </BrandedLayout>
  );
}

export default EnrollmentConfirmedTemplate;
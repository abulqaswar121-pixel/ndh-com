import * as React from "react";
import { BrandedLayout, H1, P, InfoCard, CTA } from "./BrandedLayout";

export function AcademyProjectRevisionTemplate(props: {
  studentName?: string;
  courseName: string;
  projectBrief?: string;
  directorNote?: string;
  resubmitUrl: string;
}) {
  return (
    <BrandedLayout preview={`Revision needed for your ${props.courseName} project`}>
      <H1>Project needs revision</H1>
      <P>Hi {props.studentName || "there"}, your capstone project for <strong>{props.courseName}</strong> has been reviewed and needs some revisions before approval.</P>
      {props.directorNote && (
        <InfoCard rows={[{ k: "Director feedback", v: props.directorNote }]} />
      )}
      <P>Please update your submission based on the feedback and resubmit. You can edit your project from your learning dashboard.</P>
      <CTA href={props.resubmitUrl} label="Revise my project" />
      {props.projectBrief && (
        <InfoCard rows={[{ k: "Original brief", v: props.projectBrief.slice(0, 400) + (props.projectBrief.length > 400 ? "..." : "") }]} />
      )}
    </BrandedLayout>
  );
}

export default AcademyProjectRevisionTemplate;

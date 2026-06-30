import * as React from "react";
import { BrandedLayout, H1, P, CTA, InfoCard } from "./BrandedLayout";

export function CertificateIssuedTemplate(props: {
  studentName?: string;
  programName: string;
  certificateNumber: string;
  grade?: string;
  issueDate?: string;
  verifyUrl: string;
  downloadUrl?: string;
}) {
  return (
    <BrandedLayout preview={`Your NDH certificate for ${props.programName} is ready`}>
      <H1>Congratulations, you graduated 🎉</H1>
      <P>Hi {props.studentName || "there"}, your NDH Academy certificate for <strong>{props.programName}</strong> has been issued and is now ready to share with employers and partners.</P>
      <InfoCard rows={[
        { k: "Program", v: <strong>{props.programName}</strong> },
        { k: "Certificate #", v: props.certificateNumber },
        ...(props.grade ? [{ k: "Grade", v: props.grade }] : []),
        ...(props.issueDate ? [{ k: "Issued", v: props.issueDate }] : []),
        { k: "Public verify URL", v: props.verifyUrl },
      ]} />
      <P>Anyone can verify the certificate using the public link above or by scanning the QR code on the document.</P>
      <CTA href={props.downloadUrl || props.verifyUrl} label="Download my certificate" />
    </BrandedLayout>
  );
}

export default CertificateIssuedTemplate;
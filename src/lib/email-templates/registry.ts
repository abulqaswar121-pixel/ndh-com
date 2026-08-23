import type { ComponentType } from 'react'
import { WelcomeTemplate } from './WelcomeTemplate'
import { TaskSubmittedTemplate } from './TaskSubmittedTemplate'
import { PmAssignedTemplate } from './PmAssignedTemplate'
import { QuoteSentTemplate } from './QuoteSentTemplate'
import { PaymentReceivedTemplate } from './PaymentReceivedTemplate'
import { TaskDeliveredTemplate } from './TaskDeliveredTemplate'
import { EnrollmentConfirmedTemplate } from './EnrollmentConfirmedTemplate'
import { CertificateIssuedTemplate } from './CertificateIssuedTemplate'
import { AcademyProjectRevisionTemplate } from './AcademyProjectRevisionTemplate'
import { template as talentInvitation } from './TalentInvitationTemplate'
import { template as talentTaskAssigned } from './TalentTaskAssignedTemplate'
import { template as talentRevision } from './TalentRevisionTemplate'
import { template as talentPayment } from './TalentPaymentTemplate'
import { template as pmInvitation } from './PmInvitationTemplate'
import { template as pmNewTask } from './PmNewTaskTemplate'
import { template as pmQuoteResponse } from './PmQuoteResponseTemplate'
import { template as pmTalentSubmission } from './PmTalentSubmissionTemplate'
import { template as pmOverdueAlert } from './PmOverdueAlertTemplate'
import { template as pmWeeklyReport } from './PmWeeklyReportTemplate'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome: {
    component: WelcomeTemplate,
    subject: 'Welcome to Najeeb Digital Hub 🚀',
    displayName: 'Welcome',
    previewData: { name: 'Aisha', dashboardUrl: 'https://ndh.com.ng/dashboard/client' },
  },
  task_submitted: {
    component: TaskSubmittedTemplate,
    subject: 'Your task has been received — NDH',
    displayName: 'Task Submitted',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      category: 'design',
      tier: 'professional',
      pmName: 'Yusuf (Design PM)',
    },
  },
  pm_assigned: {
    component: PmAssignedTemplate,
    subject: (d: Record<string, any>) => `New task assigned to you — ${d.taskTitle || 'NDH'}`,
    displayName: 'PM Notification',
    previewData: {
      pmName: 'Yusuf',
      taskTitle: 'New brand identity',
      category: 'design',
      tier: 'professional',
      clientName: 'Aisha',
      budgetRange: '₦200,000 – ₦500,000',
      deadline: 'Dec 31, 2025',
    },
  },
  quote_sent: {
    component: QuoteSentTemplate,
    subject: 'Quote ready for your task — NDH',
    displayName: 'Quote Sent',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      amount: '₦350,000',
      notes: 'Includes 2 revision rounds.',
    },
  },
  payment_received: {
    component: PaymentReceivedTemplate,
    subject: 'Payment confirmed — Work is starting',
    displayName: 'Payment Received',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      amount: '₦350,000',
      reference: 'NDH-1736000000-AB12CD',
    },
  },
  task_delivered: {
    component: TaskDeliveredTemplate,
    subject: 'Your task is ready for review',
    displayName: 'Task Delivered',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      pmName: 'Yusuf',
    },
  },
  enrollment_confirmed: {
    component: EnrollmentConfirmedTemplate,
    subject: (d: Record<string, any>) => `You're enrolled — ${d.programName || 'NDH Academy'}`,
    displayName: 'Enrolment Confirmed',
    previewData: {
      studentName: 'Aisha',
      programName: 'Diploma in Digital Marketing',
      programType: 'Diploma',
      duration: '6 months',
      amount: '₦120,000',
      reference: 'NDH-ENR-1736000000-AB12CD',
    },
  },
  certificate_issued: {
    component: CertificateIssuedTemplate,
    subject: (d: Record<string, any>) => `Your NDH certificate — ${d.programName || 'NDH Academy'}`,
    displayName: 'Certificate Issued',
    previewData: {
      studentName: 'Aisha',
      programName: 'Diploma in Digital Marketing',
      certificateNumber: 'NDH-CERT-2026-000142',
      grade: 'Distinction',
      issueDate: 'June 30, 2026',
      verifyUrl: 'https://ndh.com.ng/verify/NDH-CERT-2026-000142',
    },
  },
  talent_invitation: talentInvitation,
  talent_task_assigned: talentTaskAssigned,
  talent_revision_required: talentRevision,
  talent_payment_processed: talentPayment,
  pm_invitation: pmInvitation,
  pm_new_task: pmNewTask,
  pm_quote_response: pmQuoteResponse,
  pm_talent_submission: pmTalentSubmission,
  pm_overdue_alert: pmOverdueAlert,
  pm_weekly_report: pmWeeklyReport,
  academy_project_revision: {
    component: AcademyProjectRevisionTemplate,
    subject: (d: Record<string, any>) => `Revision needed — ${d.courseName || 'your project'}`,
    displayName: 'Academy Project — Revision Needed',
    previewData: {
      studentName: 'Aisha',
      courseName: 'AI Graphic Design',
      directorNote: 'Please improve the color contrast and add mockups.',
      resubmitUrl: 'https://ndh.com.ng/academy/learn/ai-graphic-design',
      projectBrief: 'Design a brand identity for a fintech startup...',
    },
  },
}
